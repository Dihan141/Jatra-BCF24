import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TripAlbums = () => {
  const tripAlbumsInitial = [
    {
      tripId: 'trip001',
      tripName: 'Trip to the Alps',
      images: [],
    },
    {
      tripId: 'trip002',
      tripName: 'Sahara Desert Adventure',
      images: [],
    },
    {
      tripId: 'trip003',
      tripName: 'Tokyo City Exploration',
      images: [],
    },
    // Add more albums as needed...
  ];

  const [tripAlbums, setTripAlbums] = useState(tripAlbumsInitial);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false); // Loader state
  const albumsPerPage = 2; // Set the number of albums per page
  const navigate = useNavigate();

  // Pagination logic
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = tripAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

  // Cloudinary Upload Function for Multiple Photos
  const uploadPhotosToCloudinary = async (photos) => {
    const uploadPromises = photos.map(async (photo) => {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', 'datanalytica'); // Set your preset

      const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      return json.secure_url; // Return the Cloudinary URL
    });

    return Promise.all(uploadPromises); // Wait for all uploads to complete
  };

  // Handle multiple file uploads
  const handleImageUpload = async (tripId, event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsUploading(true); // Show loader
    try {
      const uploadedImageUrls = await uploadPhotosToCloudinary(files); // Upload all files

      // Update the state with the newly uploaded images
      const updatedAlbums = tripAlbums.map((album) => {
        if (album.tripId === tripId) {
          return {
            ...album,
            images: [...album.images, ...uploadedImageUrls], // Add new image URLs
          };
        }
        return album;
      });

      setTripAlbums(updatedAlbums); // Update state with new albums and images
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false); // Hide loader
    }
  };

  // Navigate to gallery view for the selected trip
  const handleViewGallery = (tripId, images) => {
    navigate(`/gallery/${tripId}`, { state: { images } });
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(tripAlbums.length / albumsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="trip-albums-container">
      <h1>Trip Albums</h1>

      {isUploading && <div>Uploading photos, please wait...</div>} {/* Loader */}

      {/* Display Current Page of Albums */}
      <ul className="trip-albums-grid">
        {currentAlbums.map((album) => (
          <li key={album.tripId} className="album-item">
            <div className="album-thumbnail">
              <h3>{album.tripName}</h3>
            </div>

            {/* Upload Photos Section */}
            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageUpload(album.tripId, e)}
                style={{ marginBottom: '10px' }}
              />
              <button onClick={() => handleViewGallery(album.tripId, album.images)}>
                View Gallery
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Centered Pagination Controls */}
      <div className="pagination-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(tripAlbums.length / albumsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TripAlbums;
