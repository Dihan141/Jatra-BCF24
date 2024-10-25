import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TripAlbums = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [tripAlbums, setTripAlbums] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Items per page
  const navigate = useNavigate();

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

      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [tripId]: [],
      }));

      // Uncomment if you want to post the uploaded images to the backend
      await fetch(`${backendUrl}/api/album/update/${tripId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ photos: uploadedImageUrls }),
      });

      await fetch(`http://localhost:8000/upload-images/?tenant_id=${tripId}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json', // Corrected this line
        },
        body: JSON.stringify({
            images: uploadedImageUrls, // Ensure this is an array of image URLs
            metadata: {
                additionalProp1: "string",
                additionalProp2: "string",
                additionalProp3: "string"
            }
        }),
    });


    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewGallery = (tripId, images) => {
    navigate(`/gallery/${tripId}`, { state: { images } });
  };

  // Pagination Logic
  const totalPages = Math.ceil(tripAlbums.length / itemsPerPage);
  const currentItems = tripAlbums.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === 'next' && prevPage < totalPages) return prevPage + 1;
      if (direction === 'prev' && prevPage > 1) return prevPage - 1;
      return prevPage;
    });
  };

  return (
    <div className="trip-albums-container">
      <h1>Trip Albums</h1>

      {isUploading && <div>Uploading photos, please wait...</div>}

      <ul className="trip-albums-grid">
        {currentItems.map((album) => (
          <li key={album._id} className="album-item">
            <div className="album-thumbnail">
              <h3>{album.title}</h3>
            </div>

            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelect(album._id, e)}
                style={{ marginBottom: '10px' }}
              />
              <button
                key={`upload-${album._id}`}
                onClick={() => handleImageUpload(album._id)}
                disabled={!selectedFiles[album._id] || !selectedFiles[album._id].length}
              >
                Upload Images
              </button>
              <button
                key={`view-${album._id}`}
                onClick={() => handleViewGallery(album._id)}
              >
                View Gallery
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TripAlbums;
