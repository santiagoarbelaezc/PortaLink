const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const verifyToken = require('../middleware/auth.middleware');

// Public route to track events (called by visitors)
router.post('/track', analyticsController.trackEvent);

// Protected route to get dashboard metrics (called by admin)
router.get('/metrics', verifyToken, analyticsController.getDashboardMetrics);

module.exports = router;
