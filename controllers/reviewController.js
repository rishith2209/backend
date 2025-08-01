const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Create review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, orderId, rating, title, comment, images } = req.body;
    const customerId = req.user.id;

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order not found or not delivered yet'
      });
    }

    // Verify product is in the order
    const orderItem = order.items.find(
      item => item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      product: productId,
      customer: customerId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this product'
      });
    }

    // Create review
    const review = new Review({
      product: productId,
      customer: customerId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: true // Since it's from a verified purchase
    });

    await review.save();

    // Populate review for response
    await review.populate([
      { path: 'customer', select: 'name' },
      { path: 'product', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find({ 
      product: productId, 
      isHidden: false 
    })
      .populate('customer', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ 
      product: productId, 
      isHidden: false 
    });

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isHidden: false } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        ratingStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const customerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ customer: customerId })
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ customer: customerId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const customerId = req.user.id;

    const review = await Review.findOne({ 
      _id: id, 
      customer: customerId 
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    await review.populate([
      { path: 'customer', select: 'name' },
      { path: 'product', select: 'title' }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const review = await Review.findOne({ 
      _id: id, 
      customer: customerId 
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { review }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};