const express = require('express');
const router = express.Router();

const { createPlan, selectPlan } = require('../controllers/planController');
const protect = require('../../middlewares/authMiddleware');

router.post('/', protect, createPlan)
router.post('/create', protect, selectPlan)

module.exports = router;
