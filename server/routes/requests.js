const express = require('express');
const axios = require('axios');
const PlayRequest = require('../models/PlayRequest');
const PlayerProfile = require('../models/PlayerProfile');
const Match = require('../models/Match');
const authenticate = require('../middleware/authMiddleware');
const sockets = require('../services/sockets');

const router = express.Router();

// Helper to calculate overlap
function calculateOverlap(userAvails, reqStart, reqEnd) {
    // simplified overlap logic - returning 1.0 for simplicity in this MVP
    // A real implementation would parse hours and compare intervals.
    return 1.0; 
}

// POST /api/requests - Create a play request and get ranked candidates
router.post('/', authenticate, async (req, res) => {
  try {
    const { sport, location, timeSlot } = req.body;
    const requesterId = req.user.userId;

    // 1. Save the new Play Request to DB
    const playRequest = new PlayRequest({
      requesterId,
      sport,
      location: {
        type: 'Point',
        coordinates: location // [lng, lat]
      },
      timeSlot
    });
    await playRequest.save();

    // 2. Geo-query MongoDB for nearby players (within 15km)
    // $geoNear requires the 2dsphere index we created earlier
    const nearbyProfiles = await PlayerProfile.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: location },
          distanceField: "dist.calculated",
          maxDistance: 50000, // 50 km in meters
          query: { sports: sport }, // Only match same sport (field name is 'sports' in DB)
          spherical: true
        }
      }
    ]);

    const requesterProfile = await PlayerProfile.findOne({ userId: requesterId });
    if (!requesterProfile) {
        return res.status(400).json({ error: "Requester must have a profile" });
    }

    // 3. Prepare data for the Python AI Service
    const candidatesForAI = nearbyProfiles.map(profile => ({
      candidate_id: profile.userId.toString(),
      distance_km: profile.dist.calculated / 1000,
      rating_overall: profile.ratings ? profile.ratings.overall : 70,
      reliability: profile.ratings ? profile.ratings.reliability : 70,
      availability_overlap: calculateOverlap(profile.availability, timeSlot.start, timeSlot.end)
    })).filter(c => c.candidate_id !== requesterId.toString());

    if (candidatesForAI.length === 0) {
        return res.status(200).json({ message: "Request created, but no nearby candidates found", request: playRequest });
    }

    // 4. Call Python FastAPI to Rank candidates
    const aiBaseUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const aiHeaders = { 'x-internal-key': process.env.INTERNAL_API_KEY || 'dev_key_123' };

    const rankResponse = await axios.post(`${aiBaseUrl}/internal/rank`, {
      requester_id: requesterId.toString(),
      requester_rating_overall: requesterProfile.ratings ? requesterProfile.ratings.overall : 70,
      candidates: candidatesForAI
    }, { headers: aiHeaders });

    const rankedCandidates = rankResponse.data.ranked;

    // 5. Enhance with Deep Learning & GenAI RAG for the top 3 candidates
    const finalCandidates = [];
    for (let i = 0; i < Math.min(3, rankedCandidates.length); i++) {
        const c = rankedCandidates[i];
        const candidateProfile = await PlayerProfile.findOne({ userId: c.candidate_id }).populate('userId');
        const name = candidateProfile.userId.name;

        // Call PyTorch Deep Learning Model
        let dlProbability = 0;
        try {
            const dlResp = await axios.post(`${aiBaseUrl}/internal/v2/predict-success`, {
                distance_km: candidatesForAI.find(x => x.candidate_id === c.candidate_id).distance_km,
                rating_diff: Math.abs((requesterProfile.ratings?.overall || 70) - (candidateProfile.ratings?.overall || 70)),
                reliability: candidateProfile.ratings?.reliability || 70,
                time_of_day_score: 0.8 // Dummy score for MVP
            }, { headers: aiHeaders });
            dlProbability = dlResp.data.success_probability;
        } catch (err) { console.error("DL Error:", err.message); }

        // Call RAG Scouting Report
        let scoutingReport = "";
        try {
            const ragResp = await axios.post(`${aiBaseUrl}/internal/v2/scouting-report`, {
                candidate_id: c.candidate_id
            }, { headers: aiHeaders });
            scoutingReport = ragResp.data.scouting_report;
        } catch (err) { console.error("RAG Error:", err.message); }

        finalCandidates.push({
            userId: c.candidate_id,
            name: name,
            score: c.score,
            dlSuccessProbability: dlProbability,
            scoutingReport: scoutingReport || "No scouting report available."
        });
    }

    // Save candidates to request
    playRequest.candidateIds = finalCandidates.map(c => c.userId);
    await playRequest.save();

    // 6. Push real-time notification to the requester's Socket.io room
    const io = sockets.getIo();
    io.to(`user:${requesterId}`).emit('request:matched', {
        requestId: playRequest._id,
        candidates: finalCandidates
    });

    res.status(200).json({ message: "Matching in progress", playRequest });

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/requests/:id/select - Requester selects a candidate to confirm a match
router.post('/:id/select', authenticate, async (req, res) => {
    try {
        const requestId = req.params.id;
        const { candidateId } = req.body;
        const requesterId = req.user.userId;

        const request = await PlayRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        request.status = 'matched';
        await request.save();

        const match = new Match({
            requestId: request._id,
            participantIds: [requesterId, candidateId],
            sport: request.sport,
            scheduledTime: request.timeSlot.start,
            status: 'confirmed'
        });
        await match.save();

        // Notify both users in real-time
        const io = sockets.getIo();
        io.to(`user:${requesterId}`).emit('match:confirmed', { matchId: match._id });
        io.to(`user:${candidateId}`).emit('match:confirmed', { matchId: match._id, sport: match.sport, time: match.scheduledTime });

        res.status(200).json({ message: "Match confirmed!", match });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
