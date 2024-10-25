import React, { useEffect, useState } from 'react';
import './css/Gallery.css';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Gallery = () => {
    const { user } = useAuthContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [images, setImages] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { id } = useParams();

    const fetchTrips = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/album/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`, // Ensure user.token is defined
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trips');
            }

            const data = await response.json();
            console.log(data);

            // Check if albums array is not empty
            if (data.albums && data.albums.length > 0) {
                // Extract photos from the first album
                setImages(data.albums[0].photos || []); // Set to an empty array if no photos found
            } else {
                setImages([]); // Set to an empty array if no albums
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch photos.'); // Update error state
        }
    };

    useEffect(() => {
        fetchTrips(); // Fetch photos on component mount
    }, [id]); // Depend on id to refetch when id changes

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        if (!searchTerm) return;

        setLoading(true);
        setError('');

        try {
            console.log(id);
            console.log(searchTerm);
            const response = await fetch(`http://localhost:8000/search-images?query=${searchTerm}&tenant_id=${id}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                }
            });
            const data1 = await response.json();
            console.log(data1);
            const extractedImages = data1.matches.map(match => match.id);
            setImages(extractedImages);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch images.');
            }

            const data = await response.json(); // Only parse if response is OK
            console.log(data);

            setImages(data.imageUrls); // Assuming data.imageUrls is an array of URLs
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to fetch images. Please try again.');
        } finally {
            setLoading(false); // Always executed after try/catch
        }
    };

    return (
        <div className="gallery-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
                {/* Uncomment the button if you want it back */}
                {/* <button type="submit" className="search-button">Search</button> */}
            </form>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="gallery">
                    {error && <p className="error-message">{error}</p>} {/* Display error message */}
                    {images.map((url, index) => (
                        <div key={index} className="gallery-item">
                            <img src={url} alt={`Image ${index + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
