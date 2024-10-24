import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './css/Blogs.css'; 

const Blogs = () => {
  // Dummy blogs data
  const dummyBlogs = [
    {
      id: 1,
      text: `# Exploring the Alps \n\nThe Alps are a stunning range of mountains, offering breathtaking views and exhilarating activities.`,
      tripId: 'trip001',
      userId: 'user001',
      tripName: 'Trip to the Alps'
    },
    {
      id: 2,
      text: `# Adventure in the Sahara Desert \n\nDiscovering the vast desert landscape was a surreal experience. The golden dunes stretch endlessly.`,
      tripId: 'trip002',
      userId: 'user002',
      tripName: 'Sahara Desert Adventure'
    },
    {
      id: 3,
      text: `# Journey through Tokyo \n\nTokyo is a vibrant city, full of life and culture. Every corner you turn has something unique to offer.`,
      tripId: 'trip003',
      userId: 'user003',
      tripName: 'Tokyo City Exploration'
    },
    {
      id: 4,
      text: `# Camping in Yosemite \n\nYosemite National Park is a paradise for nature lovers. Camping here was a serene and unforgettable experience.`,
      tripId: 'trip004',
      userId: 'user004',
      tripName: 'Yosemite Camping Trip'
    },
    {
      id: 5,
      text: `# Backpacking across Europe \n\nA backpacking journey through Europe offers incredible diversity in landscapes, cultures, and history.`,
      tripId: 'trip005',
      userId: 'user005',
      tripName: 'Europe Backpacking Journey'
    },
    {
      id: 6,
      text: `# Exploring Australia \n\nThe vast wilderness and unique wildlife of Australia are a must-see for every adventurer.`,
      tripId: 'trip006',
      userId: 'user006',
      tripName: 'Australia Adventure'
    },
    // More blogs...
  ];

  const blogsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBlogId, setActiveBlogId] = useState(null);

  const handleBlogClick = (id) => {
    setActiveBlogId((prevId) => (prevId === id ? null : id)); // Toggle visibility
  };

  // Calculate the range of blogs to display on the current page
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = dummyBlogs.slice(startIndex, startIndex + blogsPerPage);
  const totalPages = Math.ceil(dummyBlogs.length / blogsPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="blogs-container">
      <h1>Blogs</h1>
      <ul className="blogs-list">
        {currentBlogs.map((blog) => (
          <li key={blog.id} className="blog-item" onClick={() => handleBlogClick(blog.id)}>
            <h3>{blog.tripName}</h3>
            {activeBlogId === blog.id && (
              <div className="blog-content">
                <ReactMarkdown>{blog.text}</ReactMarkdown> {/* Render markdown */}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Blogs;
