const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken: auth } = require('../middleware/auth');

// Validation middleware
const addToWishlistValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Wishlist routes
router.get('/', auth, wishlistController.getWishlist);
router.post('/add', auth, addToWishlistValidation, wishlistController.addToWishlist);
router.delete('/remove/:productId', auth, wishlistController.removeFromWishlist);
router.delete('/clear', auth, wishlistController.clearWishlist);
router.get('/check/:productId', auth, wishlistController.checkWishlist);

module.exports = router;