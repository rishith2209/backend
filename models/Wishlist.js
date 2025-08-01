const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const existingProduct = this.products.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (!existingProduct) {
    this.products.push({ product: productId });
  }
  
  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    item => item.product.toString() !== productId.toString()
  );
  
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(
    item => item.product.toString() === productId.toString()
  );
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.products = [];
  return this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema);