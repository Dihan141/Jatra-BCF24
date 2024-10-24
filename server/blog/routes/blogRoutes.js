const express = require('express');
const { generateBlog } = require('../controllers/blogController');
const protect = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/:planId/generate', protect, generateBlog);  // Generate a blog for a trip

module.exports = router;
