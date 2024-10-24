import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import './css/Home.css'; 

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194,
};

const OPEN_WEATHER_API_KEY = '8a5a67e9912204d1f552752d572c26a2';

const Home = () => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [budgetCategory, setBudgetCategory] = useState('Mid Range');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [weatherData, setWeatherData] = useState([]); 
  const [mapZoom, setMapZoom] = useState(10);
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState('');
  const [totalDistance, setTotalDistance] = useState('');
  const [organizedDirections, setOrganizedDirections] = useState([]);
  const [startLocation, setStartLocation] = useState('');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const totalSteps = organizedDirections.length;

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setMapZoom(15);
        },
        () => {
          console.log("Error getting user's location.");
        }
      );
    }
  }, []);

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

  const fetchWeatherData = async (location, startDate, endDate) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${OPEN_WEATHER_API_KEY}&units=metric`; // Use metric for Celsius
    try {
      const response = await axios.get(url);
      const forecasts = response.data.list;

      const tripWeather = forecasts.filter((forecast) => {
        const forecastDate = new Date(forecast.dt * 1000);
        return (
          forecastDate >= new Date(startDate) && forecastDate <= new Date(endDate)
        );
      });

      const groupedWeather = tripWeather.reduce((acc, forecast) => {
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();

        if (!acc[forecastDate]) {
          acc[forecastDate] = []; 
        }

        acc[forecastDate].push({
          time: new Date(forecast.dt * 1000).toLocaleTimeString(),
          temperature: forecast.main.temp,
          description: forecast.weather[0].description,
        });

        return acc;
      }, {});

      return groupedWeather; 
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coordinates = await geocodeDestination(destination);
    if (coordinates) {
      setDestinationCoordinates(coordinates);
      setDirectionsResponse(null); 

      const weatherData = await fetchWeatherData(coordinates, startDate, endDate);
      setWeatherData(weatherData);
      setCurrentWeatherIndex(0); 

      const directionsServiceResponse = await new Promise((resolve, reject) => {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: userLocation,
            destination: coordinates,
            travelMode: 'TRANSIT',
          },
          (result, status) => {
            if (status === 'OK') {
              const route = result.routes[0];
              setTotalDuration(route.legs[0].duration.text);
              setTotalDistance(route.legs[0].distance.text);
              setStartLocation(route.legs[0].start_address);
              setOrganizedDirections(route.legs[0].steps.map(step => ({
                distance: step.distance.text,
                duration: step.duration.text,
                instruction: step.instructions,
              })));
              resolve(result);
            } else {
              console.error('Error fetching directions:', result);
              reject(status);
            }
          }
        );
      });

      console.log('Total Duration:', totalDuration);
      console.log('Total Distance:', totalDistance);
      console.log('Start Location:', startLocation);
      console.log('Organized Directions:', organizedDirections);
      console.log("Destination: ", destination);

      setDirectionsResponse(directionsServiceResponse);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentWeatherIndex + 1) % Object.entries(weatherData).length;
    setCurrentWeatherIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentWeatherIndex - 1 + Object.entries(weatherData).length) % Object.entries(weatherData).length;
    setCurrentWeatherIndex(prevIndex);
  };

  return (
    <div className="home-container">
      <h1>Plan Your Dream Trip</h1>

      <div className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Patuakhali"
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
      </div>
      {totalDistance && totalDuration && (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
          <h3>Travel To: {destination}</h3>
          <p><strong>Total Travel Distance:</strong> {totalDistance}</p>
          <p><strong>Total Travel Duration:</strong> {totalDuration}</p>
        </div>
      )}

      {organizedDirections.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Directions:</h3>
          <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <p><strong>Step {currentStepIndex + 1} of {organizedDirections.length}</strong></p>
            <p><strong>Distance:</strong> {organizedDirections[currentStepIndex].distance}</p>
            <p><strong>Duration:</strong> {organizedDirections[currentStepIndex].duration}</p>
            <p><strong>Instructions:</strong> {organizedDirections[currentStepIndex].instruction}</p>
          </div>
          <button onClick={handlePreviousStep} disabled={currentStepIndex === 0}>Previous</button>
          <button onClick={handleNextStep} disabled={currentStepIndex === organizedDirections.length - 1}>Next</button>
        </div>
      )}


      <div className="map-section">
        <h2>Itinerary Map</h2>
        <LoadScript googleMapsApiKey="AIzaSyBSkQu0V2fxnsxlw4SZ8vr5JIlO2ROBqBs">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={mapZoom} 
          >
            <Marker
              position={userLocation}
              label="You"
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />

            {destinationCoordinates && directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {Object.entries(weatherData).length > 0 && (
        <div className="weather-section">
          <h2>Weather Forecast</h2>
          <div className="slideshow">
            <h3>{Object.keys(weatherData)[currentWeatherIndex]}</h3>
            <ul>
              {weatherData[Object.keys(weatherData)[currentWeatherIndex]].map((weather, index) => (
                <li key={index}>
                  <strong>{weather.time}</strong>: {weather.temperature}°C, {weather.description}
                </li>
              ))}
            </ul>
            <button onClick={handlePrevious} disabled={currentWeatherIndex === 0}>Previous</button>
            <button onClick={handleNext} disabled={currentWeatherIndex === Object.keys(weatherData).length - 1}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
