const express = require('express');
const router = express.Router();

const { createPlan } = require('../controllers/planController');

router.post('/', createPlan)

module.exports = router;
