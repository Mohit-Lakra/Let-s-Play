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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLoc([lat, lng]);
          fetchNearbyPlayers(lng, lat);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default
          fetchNearbyPlayers(77.2090, 28.6139);
        }
      );
    } else {
      fetchNearbyPlayers(77.2090, 28.6139);
    }
  }, []);

  const fetchNearbyPlayers = async (lng, lat) => {
    try {
      setLoading(true);
      const response = await api.get(`/profile/nearby?lng=${lng}&lat=${lat}`);
      setPlayers(response.data);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-container">
      <div className="map-header glass-card">
        <h2>Players Near You</h2>
        <p>Found {players.length} players ready for a match.</p>
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
