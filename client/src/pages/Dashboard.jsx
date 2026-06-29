import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../api';

function Dashboard() {
  const [sport, setSport] = useState('football');
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [matchConfirmed, setMatchConfirmed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Join private user room
      newSocket.emit('join_room', userId);
    });

    // Listen for AI match results
    newSocket.on('request:matched', (data) => {
      console.log('Matches found!', data);
      setIsSearching(false);
      setCurrentRequestId(data.requestId);
      setCandidates(data.candidates);
    });

    // Listen for match confirmation
    newSocket.on('match:confirmed', (data) => {
        setMatchConfirmed(true);
        setCandidates([]);
        alert("Match Confirmed! Get ready to play.");
    });

    return () => newSocket.close();
  }, [userId]);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setCandidates([]);
    
    try {
      await api.post('/requests', {
        sport,
        location: [-122.4194, 37.7749], // Dummy SF location
        timeSlot: {
            start: new Date(Date.now() + 86400000), // Tomorrow
            end: new Date(Date.now() + 93600000)
        }
      });
      // The server will respond via Socket.io when AI ranking is done
    } catch (err) {
      console.error(err);
      setIsSearching(false);
      alert('Failed to post request. Make sure backend and AI service are running.');
    }
  };

  const handleSelectCandidate = async (candidateId) => {
      try {
          await api.post(`/requests/${currentRequestId}/select`, { candidateId });
      } catch(err) {
          console.error(err);
          alert('Error confirming match');
      }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Post Request */}
        <div className="glass-card" style={{ flex: '1 1 300px' }}>
          <h3>Find Players</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Tell us what you want to play and our AI will find the best candidates nearby.
          </p>
          
          <form onSubmit={handlePostRequest}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Select Sport</label>
            <select value={sport} onChange={(e) => setSport(e.target.value)}>
              <option value="football">Football (Soccer)</option>
              <option value="badminton">Badminton</option>
              <option value="tennis">Tennis</option>
              <option value="basketball">Basketball</option>
            </select>
            
            <button type="submit" disabled={isSearching} style={{ marginTop: '1rem' }}>
              {isSearching ? 'AI is Ranking Players...' : 'Find Match'}
            </button>
          </form>
        </div>

        {/* Right Column: Match Feed */}
        <div style={{ flex: '2 1 400px' }}>
          <h3>Match Feed</h3>
          
          {matchConfirmed && (
              <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)', margin: '0 0 0.5rem 0' }}>Match Confirmed!</h4>
                  <p style={{ margin: 0 }}>You are all set to play {sport}.</p>
              </div>
          )}

          {candidates.length === 0 && !isSearching && !matchConfirmed && (
            <div className="glass-card" style={{ textAlign: 'center', opacity: 0.5 }}>
              <p>No active requests. Post a request to see candidates.</p>
            </div>
          )}

          {candidates.map((c, index) => (
            <div key={c.userId} className="glass-card animate-fade-in" style={{ marginBottom: '1rem', animationDelay: `${index * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.name}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'var(--primary)', 
                      padding: '2px 8px', 
                      borderRadius: '12px' 
                    }}>
                      {Math.round(c.score)}% Match
                    </span>
                    {c.dlSuccessProbability && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: 'var(--accent)', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                      }}>
                        🧠 PyTorch DL: {Math.round(c.dlSuccessProbability * 100)}% Success Chance
                      </span>
                    )}
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                    <strong style={{ color: '#c4b5fd', display: 'block', marginBottom: '4px' }}>GenAI Scouting Report:</strong>
                    "{c.scoutingReport}"
                  </div>
                </div>
                <button 
                  style={{ width: 'auto', background: 'var(--accent)', padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => handleSelectCandidate(c.userId)}
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;
