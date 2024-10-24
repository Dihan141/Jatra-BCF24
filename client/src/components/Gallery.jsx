import React, { useState } from 'react';
import './css/Gallery.css';

// Dummy image URLs for testing
const dummyImageUrls = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc1HLR7XVsYWwIrwmDPLtM0U9QCd6mC8kT4A&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR-_D2E6_evsKBJ-HcomKxekkuuMuJlZbUWQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLH6Diu5FFs84dKFx_X0FFm53peAPA8ob1SQ&s',
    'https://images.pexels.com/photos/2480072/pexels-photo-2480072.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpfpjSsR5A-zVGmK7Gcgy8O4BXMxbVQWaWSQ&s',
];

const Gallery = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [images, setImages] = useState(dummyImageUrls); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        if (!searchTerm) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`YOUR_BACKEND_URL/search?query=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (response.ok) {
                setImages(data.imageUrls); // Assuming your backend returns an array of image URLs in 'imageUrls'
            } else {
                throw new Error(data.message || 'Failed to fetch images.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to fetch images. Please try again.'); 
        } finally {
            setLoading(false);
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
