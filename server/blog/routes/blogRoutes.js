const express = require('express');
const { generateBlog, getBlogs } = require('../controllers/blogController');
const protect = require('../../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getBlogs);  // Get all blogs
router.post('/generate', generateBlog);  // Generate a blog for a trip

module.exports = router;
