import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
// import './css/TripAlbums.css';

const TripAlbums = () => {
  const tripAlbums = [
    {
      tripId: 'trip001',
      tripName: 'Trip to the Alps',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc1HLR7XVsYWwIrwmDPLtM0U9QCd6mC8kT4A&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR-_D2E6_evsKBJ-HcomKxekkuuMuJlZbUWQ&s',
      ],
    },
    {
      tripId: 'trip002',
      tripName: 'Sahara Desert Adventure',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLH6Diu5FFs84dKFx_X0FFm53peAPA8ob1SQ&s',
        'https://images.pexels.com/photos/2480072/pexels-photo-2480072.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      ],
    },
    {
      tripId: 'trip003',
      tripName: 'Tokyo City Exploration',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpfpjSsR5A-zVGmK7Gcgy8O4BXMxbVQWaWSQ&s',
        // Add more URLs as needed
      ],
    },
    // Add more albums as needed...
  ];

  const navigate = useNavigate();

  const handleAlbumClick = (tripId, images) => {
    navigate(`/gallery/${tripId}`, { state: { images } }); // Pass images to the Gallery component
  };

  return (
    <div className="trip-albums-container">
      <h1>Trip Albums</h1>
      <ul className="trip-albums-list">
        {tripAlbums.map((album) => (
          <li
            key={album.tripId}
            className="album-item"
            onClick={() => handleAlbumClick(album.tripId, album.images)}
          >
            <h3>{album.tripName}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripAlbums;
