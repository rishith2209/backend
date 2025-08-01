const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed ₹100,000']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Crochet Arts',
      'Handmade Toys',
      'Handmade Decors',
      'Dresses',
      'Abstract Arts',
      'Paintings'
    ]
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Product must belong to an artisan']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  materials: [{
    type: String,
    trim: true
  }],
  careInstructions: {
    type: String,
    maxlength: [500, 'Care instructions cannot exceed 500 characters']
  },
  shippingInfo: {
    weight: Number,
    dimensions: String,
    estimatedDelivery: {
      type: String,
      default: '3-5 business days'
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ artisan: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return this.price ? `₹${this.price.toFixed(2)}` : '₹0.00';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 