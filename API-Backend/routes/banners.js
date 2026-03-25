const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

/**
 * GET /api/banners
 * Get all active banners (public endpoint)
 */
router.get('/', bannerController.getBanners);

module.exports = router;
