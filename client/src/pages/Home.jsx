import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import './css/Home.css';
import parse from 'html-react-parser';
import {useAuthContext} from '../hooks/useAuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};


const Home = () => {
  const {user} = useAuthContext();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
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
  const [travelMode, setTravelMode] = useState('TRANSIT');
  const [planData, setPlanData] = useState(null);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [showAllAttractions, setShowAllAttractions] = useState(false);

  const toggleHotels = () => setShowAllHotels(!showAllHotels);
  const toggleRestaurants = () => setShowAllRestaurants(!showAllRestaurants);
  const toggleAttractions = () => setShowAllAttractions(!showAllAttractions);

  //hotel, restaurant, attraction selections
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [selectedAttractions, setSelectedAttractions] = useState([]);

  const MAX_VISIBLE_ITEMS = 3;

  const handleHotelChange = (event) => {
    setSelectedHotel(event.target.value);
  };

  const handleRestaurantChange = (event) => {
    const value = event.target.value;
    setSelectedRestaurants((prevRestaurants) =>
      prevRestaurants.includes(value)
        ? prevRestaurants.filter((restaurant) => restaurant !== value)
        : [...prevRestaurants, value]
    );
  };

  const handleAttractionChange = (event) => {
    const value = event.target.value;
    setSelectedAttractions((prevAttractions) =>
      prevAttractions.includes(value)
        ? prevAttractions.filter((attraction) => attraction !== value)
        : [...prevAttractions, value]
    );
  };

  const handleSubmitSelection = async() => {
    const selectedData = {
      place: destination,
      from: startDate,
      to: endDate,
      preferences: budgetCategory,
      peopleCount: numTravelers,
      attractions: selectedAttractions,
      hotels: selectedHotel,
      restaurants: selectedRestaurants,
    };
    console.log('Selected Data:', selectedData);

    const response = await fetch(`${backendUrl}/api/plan/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify(selectedData),
    });

    if(response.ok){
      // const data = await response.json();
      // console.log('Plan Response:', data);
      console.log('Plan created successfully');
    } else {
      console.error('Failed to fetch:', response.statusText);
    }

    // Add API call or processing logic here to submit selected data
    // Example: post to backend
    // fetch(`${backendUrl}/api/submit-selection`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(selectedData)
    // });
  };


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

  const handleTravelModeChange = (event) => {
    const mode = event.target.value;
    setTravelMode(mode);
  };


  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const selectedStartDate = e.target.value;
    const currentDate = getCurrentDate();

    if (selectedStartDate < currentDate) {
      setDateError('Start date cannot be before today.');
    } else {
      setDateError('');
    }

    setStartDate(selectedStartDate);

    if (endDate && selectedStartDate >= endDate) {
      setDateError('End date must be greater than start date.');
    }
  };

  const handleEndDateChange = (e) => {
    const selectedEndDate = e.target.value;

    if (startDate && selectedEndDate <= startDate) {
      setDateError('End date must be greater than start date.');
    } else {
      setDateError('');
    }

    setEndDate(selectedEndDate);
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
    const geocodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;

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



      const postData = {
        place: destination,
        from: startDate,
        to: endDate,
        peopleCount: numTravelers,
      };

      try {
        console.log('User:', user.token);
        const response = await fetch(`${backendUrl}/api/plan/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify(postData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Plan Response:', data);
          setPlanData(data);
        } else {
          console.error('Failed to fetch:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }


      const directionsServiceResponse = await new Promise((resolve, reject) => {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: userLocation,
            destination: coordinates,
            travelMode: travelMode,
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
                instruction: parse(step.instructions),
              })));
              resolve(result);
            } else {
              console.error('Error fetching directions:', result);
              reject(status);
            }
          }
        );
      });

      // console.log('Total Duration:', totalDuration);
      // console.log('Total Distance:', totalDistance);
      // console.log('Start Location:', startLocation);
      // console.log('Organized Directions:', organizedDirections);
      // console.log("Destination: ", destination);

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
              onChange={handleStartDateChange}
              min={getCurrentDate()}  
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || getCurrentDate()} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="travel-mode">Select Travel Mode:</label>
            <select id="travel-mode" value={travelMode} onChange={handleTravelModeChange}>
              <option value="DRIVING">Private Car</option>
              <option value="TRANSIT">Public Transport</option>
            </select>
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
          <h3>Travel Directions:</h3>
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
        <h2> Map</h2>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} >
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

{planData && (
        <div className="plan-section">
          <h2>Available Hotels, Restaurants and Attractions</h2>
          
          {/* Hotels Section */}
          <h3>Hotels</h3>
          <ul>
            {planData.hotels.slice(0, showAllHotels ? planData.hotels.length : MAX_VISIBLE_ITEMS).map((hotel, index) => (
              <li key={index}>
                <label className="custom-input-container">
                  <input
                    type="radio"
                    name="hotel"
                    value={hotel.name}
                    checked={selectedHotel === hotel.name}
                    onChange={handleHotelChange}
                  />
                  <div className="custom-radio"></div>
                  <span className="custom-input-label">{hotel.name} - {hotel.vicinity}</span>
                </label>
              </li>
            ))}
          </ul>
          {planData.hotels.length > MAX_VISIBLE_ITEMS && (
            <button className="see-more-button" onClick={toggleHotels}>
              {showAllHotels ? 'See Less' : 'See More'}
            </button>
          )}

          {/* Restaurants Section */}
          <h3>Restaurants</h3>
          <ul>
            {planData.restaurants.slice(0, showAllRestaurants ? planData.restaurants.length : MAX_VISIBLE_ITEMS).map((restaurant, index) => (
              <li key={index}>
                <label className="custom-input-container">
                  <input
                    type="checkbox"
                    value={restaurant.name}
                    checked={selectedRestaurants.includes(restaurant.name)}
                    onChange={handleRestaurantChange}
                  />
                  <div className="custom-checkbox"></div>
                  <span className="custom-input-label">{restaurant.name} - {restaurant.vicinity}</span>
                </label>
              </li>
            ))}
          </ul>
          {planData.restaurants.length > MAX_VISIBLE_ITEMS && (
            <button className="see-more-button" onClick={toggleRestaurants}>
              {showAllRestaurants ? 'See Less' : 'See More'}
            </button>
          )}

          {/* Attractions Section */}
          <h3>Attractions</h3>
          <ul>
            {planData.attractions.slice(0, showAllAttractions ? planData.attractions.length : MAX_VISIBLE_ITEMS).map((attraction, index) => (
              <li key={index}>
                <label className="custom-input-container">
                  <input
                    type="checkbox"
                    value={attraction.name}
                    checked={selectedAttractions.includes(attraction.name)}
                    onChange={handleAttractionChange}
                  />
                  <div className="custom-checkbox"></div>
                  <span className="custom-input-label">{attraction.name} - {attraction.vicinity}</span>
                </label>
              </li>
            ))}
          </ul>
          {planData.attractions.length > MAX_VISIBLE_ITEMS && (
            <button className="see-more-button" onClick={toggleAttractions}>
              {showAllAttractions ? 'See Less' : 'See More'}
            </button>
          )}
          <br />
          {/* Submit Button */}
          <button className="submit-button" onClick={handleSubmitSelection}>
            Submit Selections
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
