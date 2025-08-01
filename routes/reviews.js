const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateToken: auth } = require('../middleware/auth');

// Validation middleware
const createReviewValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3-100 characters'),
  
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10-1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3-100 characters'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10-1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

// Review routes
router.post('/', auth, createReviewValidation, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/user', auth, reviewController.getUserReviews);
router.put('/:id', auth, updateReviewValidation, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);
router.post('/:id/helpful', auth, reviewController.markHelpful);

module.exports = router;