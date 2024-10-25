const express = require('express');
const { getAllAlbums, updateAlbum } = require('../controllers/albumController');
const protect = require('../../middlewares/authMiddleware');
const router = express.Router();

router.get('/:id', protect, getAllAlbums)
router.post('/update/:id', protect, updateAlbum)

module.exports = router;
