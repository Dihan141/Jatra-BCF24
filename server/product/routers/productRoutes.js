const express = require('express');
const protect = require('../../middlewares/authMiddleware');
const { getProducts } = require('../controller/productController');
const router = express.Router();

router.get('/getproducts', protect, getProducts);

module.exports = router;