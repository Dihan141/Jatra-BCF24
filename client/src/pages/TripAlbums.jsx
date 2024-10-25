import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TripAlbums = () => {
  // const { user } = useAuthContext();
  const user = JSON.parse(localStorage.getItem('user'));
  // console.log(user.token);

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
    {
      tripId: 'trip004',
      tripName: 'Road Trip through Italy',
      images: [],
    },
    {
      tripId: 'trip005',
      tripName: 'Beach Vacation in Hawaii',
      images: [],
    },
    // Add more albums as needed...
  ];

  const [tripAlbums, setTripAlbums] = useState(tripAlbumsInitial);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const albumsPerPage = 3; // Set the number of albums per page
  const navigate = useNavigate();

  // Pagination logic
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = tripAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/plan/get`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      console.log(data.plans);
      setTripAlbums(data.plans); 
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const uploadPhotosToCloudinary = async (photos) => {
    const imageUrlArray = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', 'datanalytica');

      const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;

      try {
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const json = await response.json();
        imageUrlArray.push(json.secure_url);
      } catch (error) {
        console.error(`Error uploading image ${photo.name}:`, error);
      }
    }

    return imageUrlArray;
  };

  const handleFileSelect = (tripId, event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [tripId]: files,
    }));
  };

  const handleImageUpload = async (tripId) => {
    if (!selectedFiles[tripId] || !selectedFiles[tripId].length) return;

    setIsUploading(true);
    try {
      const uploadedImageUrls = await uploadPhotosToCloudinary(selectedFiles[tripId]);

      const updatedAlbums = tripAlbums.map((album) => {
        if (album.tripId === tripId) {
          return {
            ...album,
            images: [...album.images, ...uploadedImageUrls],
          };
        }
        return album;
      });

      setTripAlbums(updatedAlbums);
      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [tripId]: [],
      }));
      
      console.log(uploadedImageUrls)

      // await fetch(`${backendUrl}/api/trip/${tripId}/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ photos: uploadedImageUrls }),
      // });

    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

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

      {isUploading && <div>Uploading photos, please wait...</div>}

      <ul className="trip-albums-grid">
        {currentAlbums.map((album) => (
          <li key={album.tripId} className="album-item">
            <div className="album-thumbnail">
              <h3>{album.title}</h3>
            </div>

            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelect(album.tripId, e)}
                style={{ marginBottom: '10px' }}
              />
              <button
                key={`upload-${album.tripId}`}
                onClick={() => handleImageUpload(album.tripId)}
                disabled={!selectedFiles[album.tripId] || !selectedFiles[album.tripId].length}
              >
                Upload Images
              </button>
              <button
                key={`view-${album.tripId}`}
                onClick={() => handleViewGallery(album.tripId, album.images)}
              >
                View Gallery
              </button>
            </div>
          </li>
        ))}
      </ul>

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
