const express = require('express');
const router = express.Router();

const { createPlan, selectPlan, getAllPlans } = require('../controllers/planController');
const protect = require('../../middlewares/authMiddleware');

router.post('/', protect, createPlan)
router.post('/create', protect, selectPlan)
router.get('/', getAllPlans)
router.get('/get', protect, getAllPlans)

module.exports = router;
