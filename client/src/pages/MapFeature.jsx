import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import './MapFeature.css';

// Fix for default Leaflet icons missing in React wrapper
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to recenter map when location is found
const RecenterAutomatically = ({lat, lng}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);
  return null;
}

const MapFeature = () => {
  const [players, setPlayers] = useState([]);
  const [userLoc, setUserLoc] = useState([28.6139, 77.2090]); // Default Delhi
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLoc([lat, lng]);
          fetchNearbyPlayers(lng, lat, selectedSport);
        },
        (error) => {
          console.error("Error getting location:", error);
          fetchNearbyPlayers(77.2090, 28.6139, selectedSport);
        }
      );
    } else {
      fetchNearbyPlayers(77.2090, 28.6139, selectedSport);
    }
  }, [selectedSport]); // Refetch when sport changes

  const fetchNearbyPlayers = async (lng, lat, sport) => {
    try {
      setLoading(true);
      const response = await api.get(`/profile/nearby?lng=${lng}&lat=${lat}&sport=${sport}`);
      setPlayers(response.data);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-container">
      <div className="map-header glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Players Near You</h2>
          <p>Found {players.length} players ready for a match.</p>
        </div>
        <div style={{ width: '200px' }}>
          <select 
            value={selectedSport} 
            onChange={(e) => setSelectedSport(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="all">All Sports</option>
            <option value="football">Football</option>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
            <option value="tennis">Tennis</option>
            <option value="basketball">Basketball</option>
          </select>
        </div>
      </div>

      <div className="map-wrapper glass-card">
        {loading ? (
          <div className="loading-state">Scanning radar...</div>
        ) : (
          <MapContainer center={userLoc} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RecenterAutomatically lat={userLoc[0]} lng={userLoc[1]} />

            {/* User's own marker */}
            <Marker position={userLoc}>
              <Popup>
                <strong>You are here</strong>
              </Popup>
            </Marker>

            {/* Other players */}
            {players.map((player) => {
              // Note: GeoJSON stores as [lng, lat], but Leaflet expects [lat, lng]
              const [lng, lat] = player.preferredLocation.coordinates;
              return (
                <Marker key={player._id} position={[lat, lng]}>
                  <Popup>
                    <div className="map-popup">
                      <strong>{player.userId.name || 'Player'}</strong><br/>
                      Sports: {player.sports.join(', ')}<br/>
                      Skill: {player.ratings.skill}/100<br/>
                      Overall: {player.ratings.overall}/100
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapFeature;
