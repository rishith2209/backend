const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'products.product',
        select: 'title price images category isActive stock',
        match: { isActive: true }
      });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
      await wishlist.save();
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(item => item.product);

    res.json({
      success: true,
      data: { wishlist }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Verify product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    await wishlist.addProduct(productId);

    // Populate for response
    await wishlist.populate({
      path: 'products.product',
      select: 'title price images category'
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Check if product is in wishlist
    const productExists = wishlist.products.find(
      item => item.product.toString() === productId
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove product from wishlist
    await wishlist.removeProduct(productId);

    // Populate for response
    await wishlist.populate({
      path: 'products.product',
      select: 'title price images category'
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist }
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    await wishlist.clearWishlist();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: { wishlist }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.json({
      success: true,
      data: { isInWishlist }
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};