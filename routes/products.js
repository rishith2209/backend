const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { 
  validateProduct, 
  validateProductId, 
  validateSearchQuery 
} = require('../middleware/validation');

// Public routes (with optional auth for personalized results)
router.get('/', optionalAuth, validateSearchQuery, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', optionalAuth, productController.getProductsByCategory);
router.get('/search', optionalAuth, validateSearchQuery, productController.searchProducts);
router.get('/:id', validateProductId, productController.getProductById);

// Protected routes (artisan/admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('artisan', 'admin'), 
  validateProduct, 
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('artisan', 'admin'), 
  validateProductId, 
  validateProduct, 
  productController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('artisan', 'admin'), 
  validateProductId, 
  productController.deleteProduct
);

module.exports = router; 