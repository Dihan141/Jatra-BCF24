const axios = require('axios')

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
            
            const options = {
                method: 'GET',
                url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates',
                params: {
                  latitude: lat,
                  longitude: lng,
                  arrival_date: from,
                  departure_date: to,
                  adults: peopleCount,
                  page_number: '1'
                },
                headers: {
                  'x-rapidapi-key': '999f6dac34msh1634ecab5ba26aep187ac6jsn457dbcc82fd6',
                  'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
                }
              };

            console.log(options);

            const hotelResponse = await axios.request(options);
            res.status(200).json({hotels: hotelResponse.data});
        } else {
            console.log('Location not found');
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

module.exports = {
    createPlan
}