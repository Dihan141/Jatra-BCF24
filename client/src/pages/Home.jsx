import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center (before user's location is available)
const defaultCenter = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194,
};

const Home = () => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [budgetCategory, setBudgetCategory] = useState('Mid Range');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [mapZoom, setMapZoom] = useState(10); // Initial zoom level

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setMapZoom(15); // Zoom in when the user's location is found
        },
        () => {
          console.log("Error getting user's location.");
        }
      );
    }
  }, []);

  // Function to convert area name to coordinates using Geocoding API
  const geocodeDestination = async (destination) => {
    const geocodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=AIzaSyBSkQu0V2fxnsxlw4SZ8vr5JIlO2ROBqBs`;

    try {
      const response = await axios.get(geocodingAPI);
      const location = response.data.results[0].geometry.location;
      return location;  // return the lat and lng
    } catch (error) {
      console.error('Error fetching geocode:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fetch the destination coordinates
    const coordinates = await geocodeDestination(destination);
    if (coordinates) {
      setDestinationCoordinates(coordinates);
      setDirectionsResponse(null);
    }
  };

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);
      } else {
        console.error('Error fetching directions:', response);
      }
    }
  };

  return (
    <div className="home-container">
      <h1>Plan Your Dream Trip</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Saint Martin"
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Travelers</label>
          <input
            type="number"
            value={numTravelers}
            onChange={(e) => setNumTravelers(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Budget Category</label>
          <select
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
          >
            <option value="Budget">Budget</option>
            <option value="Mid Range">Mid Range</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <button type="submit">Generate Itinerary & Route</button>
      </form>

      {/* Map Section */}
      <div className="map-section">
        <h2>Itinerary Map</h2>
        <LoadScript googleMapsApiKey="AIzaSyBSkQu0V2fxnsxlw4SZ8vr5JIlO2ROBqBs">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={mapZoom} // Dynamically set zoom level
          >
            {/* Highlight user's current location */}
            <Marker
              position={userLocation}
              label="You"
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // A custom blue icon for the user
              }}
            />

            {/* Directions Service - Fetch route */}
            {destinationCoordinates && (
              <DirectionsService
                options={{
                  destination: destinationCoordinates,  // Use lat/lng for destination
                  origin: userLocation,
                  travelMode: 'DRIVING',
                }}
                callback={directionsCallback}
              />
            )}

            {/* Directions Renderer - Show route */}
            {directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default Home;
