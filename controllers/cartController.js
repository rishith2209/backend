const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id, isActive: true })
      .populate({
        path: 'items.product',
        select: 'title price images stock isActive'
      });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id, isActive: true });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title price images stock isActive'
    });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Update quantity
    await cart.updateQuantity(productId, quantity);
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title price images stock isActive'
    });

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    await cart.removeItem(productId);
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'title price images stock isActive'
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Get cart summary (for header display)
const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          totalAmount: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart summary'
    });
  }
};

// Validate cart items (check stock availability)
const validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        data: { isValid: true, issues: [] }
      });
    }

    const issues = [];
    
    for (const item of cart.items) {
      const product = item.product;
      
      if (!product.isActive) {
        issues.push({
          productId: product._id,
          productName: product.title,
          issue: 'Product is no longer available'
        });
      } else if (product.stock < item.quantity) {
        issues.push({
          productId: product._id,
          productName: product.title,
          issue: `Only ${product.stock} items available in stock`,
          availableStock: product.stock
        });
      }
    }

    res.json({
      success: true,
      data: {
        isValid: issues.length === 0,
        issues
      }
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCart
}; 