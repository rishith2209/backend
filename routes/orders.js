const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticateToken: auth } = require('../middleware/auth');

// Validation middleware
const createOrderValidation = [
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Shipping name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
  
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5-200 characters'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2-50 characters'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2-50 characters'),
  
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('ZIP code must be 6 digits'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cod', 'card', 'upi', 'wallet'])
    .withMessage('Invalid payment method'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5-50 characters')
];

// Customer routes
router.post('/', auth, createOrderValidation, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/cancel', auth, orderController.cancelOrder);

// Artisan routes (these should be in artisan routes, but keeping here for now)
// router.get('/artisan/orders', auth, orderController.getArtisanOrders);
// router.put('/:id/status', auth, updateOrderStatusValidation, orderController.updateOrderStatus);

module.exports = router;