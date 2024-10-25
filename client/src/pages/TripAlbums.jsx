import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TripAlbums = () => {
const { user } = useAuthContext();

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
  const [selectedFiles, setSelectedFiles] = useState({}); // Store selected files per trip
  const albumsPerPage = 2; // Set the number of albums per page
  const navigate = useNavigate();

  // Pagination logic
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = tripAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

  const fetchTrips = async () => {
    console.log(user);
    try {
      const response = await fetch(`${backendUrl}/api/plan/get`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      console.log(data);

      setTripAlbums(data); 
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Cloudinary Upload Function for Multiple Photos
  const uploadPhotosToCloudinary = async (photos) => {
    const imageUrlArray = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', 'datanalytica'); // Set your preset

      const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;

      try {
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const json = await response.json();
        imageUrlArray.push(json.secure_url); // Store each image URL
      } catch (error) {
        console.error(`Error uploading image ${photo.name}:`, error);
      }
    }

    return imageUrlArray; // Return array of uploaded image URLs
  };

  // Handle file selection
  const handleFileSelect = (tripId, event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [tripId]: files, // Store selected files for each tripId
    }));
  };

  // Handle image upload on button click and call backend API
  const handleImageUpload = async (tripId) => {
    if (!selectedFiles[tripId] || !selectedFiles[tripId].length) return;

    setIsUploading(true); // Show loader
    try {
      const uploadedImageUrls = await uploadPhotosToCloudinary(selectedFiles[tripId]); // Upload selected files

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
      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [tripId]: [], // Clear selected files after upload
      }));

      // console.log(JSON.stringify({ images: uploadedImageUrls }));
      // Call backend API with tripId and uploaded images
      await fetch(`${backendUrl}/api/trip/${tripId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: uploadedImageUrls }), // Send uploaded image URLs to backend
      });

    } catch (error) {
      console.error('Error uploading images:', error);
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
                onChange={(e) => handleFileSelect(album.tripId, e)} // Pass tripId for each album
                style={{ marginBottom: '10px' }}
              />
              <button
                key={`upload-${album.tripId}`} // Unique key for each upload button
                onClick={() => handleImageUpload(album.tripId)} // Pass tripId for each album
                disabled={!selectedFiles[album.tripId] || !selectedFiles[album.tripId].length}
              >
                Upload Images
              </button>
              <button
                key={`view-${album.tripId}`} // Unique key for each view gallery button
                onClick={() => handleViewGallery(album.tripId, album.images)}
              >
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
