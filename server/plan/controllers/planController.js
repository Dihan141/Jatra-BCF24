const axios = require('axios');
const Plan = require('../models/planModel');

const createPlan = async (req, res) => {
    try {
        console.log(req.body);
        const { place, from, to, preferences, peopleCount } = req.body;  

        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                address: place,
                key: process.env.MAP_API
            }
        });
        console.log(response.data.status);

        if (response.data.status === 'OK') {
            const result = response.data.results[0];
            console.log(result)
            const { lat, lng } = result.geometry.location;
            console.log(`Latitude: ${lat}, Longitude: ${lng}`);

            const hotelOptions = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/search-by-coordinates',
                params: {
                  adults_number: peopleCount,
                  checkin_date: from,
                  locale: 'en-gb',
                  room_number: '1',
                  units: 'metric',
                  filter_by_currency: 'USD',
                  longitude: lng,
                  checkout_date: to,
                  latitude: lat,
                  order_by: 'popularity',
                  include_adjacency: 'true',
                  page_number: '0'
                },
                headers: {
                  'x-rapidapi-key': '511cc779a3mshbeefe33875606d2p19c9bejsn334922384c38',
                  'x-rapidapi-host': 'booking-com.p.rapidapi.com'
                }
              };

            const hotelResponse = await getHotelsInArea(lat, lng);
            //const hotelResponse = await axios.request(hotelOptions);

            const restaurantResponse = await getRestaurantsInArea(lat, lng);

            const attractionsResponse = await getNearbyAttractions(lat, lng);
            
            // const options = {
            //     method: 'GET',
            //     url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates',
            //     params: {
            //       latitude: lat,
            //       longitude: lng,
            //       arrival_date: from,
            //       departure_date: to,
            //       adults: peopleCount,
            //       page_number: '1'
            //     },
            //     headers: {
            //       'x-rapidapi-key': '999f6dac34msh1634ecab5ba26aep187ac6jsn457dbcc82fd6',
            //       'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
            //     }
            //   };

            // console.log(options);

            // const hotelResponse = await axios.request(options);
            res.status(200).json({hotels: hotelResponse, attractions: attractionsResponse, restaurants: restaurantResponse});
        } else {
            console.log('Location not found');
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


const getHotelsInArea = async (latitude, longitude, radius = 1500) => {
    const apiKey = process.env.MAP_API; // Replace with your Google Places API key
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    const params = {
        location: `${latitude},${longitude}`,
        radius: radius, // Radius in meters (e.g., 1500 meters)
        type: 'lodging', // Specify 'lodging' to search for hotels
        key: apiKey
    };

    try {
        const response = await axios.get(url, { params });
        if (response.data.status === 'OK') {
            const hotels = response.data.results; // Array of hotel results
            return hotels;
        } else {
            throw new Error(`Error fetching hotels: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; // Propagate the error
    }
};

const getRestaurantsInArea = async (latitude, longitude, radius = 1500) => {
    const apiKey = process.env.MAP_API; // Replace with your Google Places API key
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    const params = {
        location: `${latitude},${longitude}`,
        radius: radius, // Radius in meters (e.g., 1500 meters)
        type: 'restaurant', // Specify 'restaurant' to search for restaurants
        key: apiKey
    };

    try {
        const response = await axios.get(url, { params });
        if (response.data.status === 'OK') {
            const restaurants = response.data.results; // Array of restaurant results
            return restaurants;
        } else {
            throw new Error(`Error fetching restaurants: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; // Propagate the error
    }
};

const getNearbyAttractions = async (latitude, longitude, radius = 15000) => {
    const apiKey = process.env.MAP_API; // Replace with your Google Places API key
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    const params = {
        location: `${latitude},${longitude}`,
        radius: radius, // Radius in meters (e.g., 1500 meters)
        type: 'tourist_attraction', // Specify 'tourist_attraction' to search for attractions
        key: apiKey
    };

    try {
        const response = await axios.get(url, { params });
        if (response.data.status === 'OK') {
            const attractions = response.data.results; // Array of attraction results
            return attractions;
        } else {
            throw new Error(`Error fetching attractions: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; // Propagate the error
    }
};

const selectPlan = async (req, res) => {
    try {
        const uid = req.userId
        const { place, from, to, preferences, peopleCount, attractions, hotels, restaurants } = req.body;
        const plan = new Plan({
            title: generateTripTitle(place),
            place,
            from,
            to,
            preferences,
            peopleCount,
            attractions,
            hotels: [hotels],
            restaurants,
            uid
        });
        await plan.save();
        res.status(201).json({ message: 'Plan created successfully', plan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.status(200).json({ plans });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPlansByUid = async (req, res) => {
    try {
        const uid = req.userId;
        const plans = await Plan.find({ uid });
        res.status(200).json({ plans });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const generateTripTitle = (place) => {
    const templates = [
      `Trip to ${place}`,
      `${place} Travel`,
      `Explore ${place}`,
      `${place} Adventure`,
      `Discover ${place}`,
      `Visit ${place}`,
      `A Journey to ${place}`,
      `Experience ${place}`,
      `${place} Vacation`,
      `A Getaway to ${place}`,
    ];
  
    // Shuffle the array to randomize output
    return templates[Math.floor(Math.random() * templates.length)];
};

module.exports = {
    createPlan,
    selectPlan,
    getAllPlans,
    getPlansByUid,
}