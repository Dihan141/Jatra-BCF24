import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './css/Blogs.css'; 

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBlogId, setActiveBlogId] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const blogsPerPage = 5;

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/blog/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      console.log(data);

      // Map through the blogs to format them correctly
      const formattedBlogs = data.blogs.map(blog => ({
        _id: blog._id,
        tripName: blog.tripName,
        // Extract and join text content from the nested array
        text: blog.text.map(item => item.text).join(' '), // Join text items into a single string
      }));

      setBlogs(formattedBlogs); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleBlogClick = (_id) => {
    setActiveBlogId((prevId) => (prevId === _id ? null : _id));
  };

  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="blogs-container">
      <h1>Blogs</h1>
      <ul className="blogs-list">
        {currentBlogs.map((blog) => (
          <li key={blog._id} className="blog-item" onClick={() => handleBlogClick(blog._id)}>
            <h3>{blog.tripName}</h3>
            {activeBlogId === blog._id && (
              <div className="blog-content">
                <ReactMarkdown>{blog.text}</ReactMarkdown>
              </div>
            )}
          </li>
        ))}
      </ul>

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
