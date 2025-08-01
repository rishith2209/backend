const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ product: 1, customer: 1, order: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    { $match: { product: this.product, isHidden: false } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews
    });
  }
});

// Update product rating when review is removed
reviewSchema.post('remove', async function() {
  const Review = this.constructor;
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    { $match: { product: this.product, isHidden: false } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);