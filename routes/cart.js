const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');
const { validateCartItem, validateCartProductId } = require('../middleware/validation');

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', cartController.getCart);

// Get cart summary (for header display)
router.get('/summary', cartController.getCartSummary);

// Validate cart items
router.get('/validate', cartController.validateCart);

// Add item to cart
router.post('/add', validateCartItem, cartController.addToCart);

// Update cart item quantity
router.put('/item/:productId', validateCartProductId, cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:productId', validateCartProductId, cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router; 