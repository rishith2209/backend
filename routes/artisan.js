const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisanController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// All artisan routes require authentication and artisan role
router.use(authenticateToken);
router.use(authorizeRoles('artisan', 'admin'));

// Dashboard stats
router.get('/dashboard/stats', artisanController.getDashboardStats);

// Analytics
router.get('/analytics', artisanController.getArtisanAnalytics);

// Product management
router.get('/products', artisanController.getArtisanProducts);
router.put('/products/:productId/status', artisanController.updateProductStatus);
router.put('/products/:productId/featured', artisanController.updateProductFeatured);

// Profile management
router.get('/profile', artisanController.getArtisanProfile);
router.put('/profile', validateProfileUpdate, artisanController.updateArtisanProfile);

module.exports = router; 