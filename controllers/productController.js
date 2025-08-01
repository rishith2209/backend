const Product = require('../models/Product');
const User = require('../models/User');

// Get all products with filtering and pagination
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      q: searchQuery,
      sort = 'newest',
      minPrice,
      maxPrice,
      artisan
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (artisan) {
      filter.artisan = artisan;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'az':
        sortObj = { title: 1 };
        break;
      case 'za':
        sortObj = { title: -1 };
        break;
      case 'pricehl':
        sortObj = { price: -1 };
        break;
      case 'pricelh':
        sortObj = { price: 1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default: // newest
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(filter)
      .populate('artisan', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisan', 'name email artisanProfile');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product (artisan only)
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      artisan: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    // Populate artisan info
    await product.populate('artisan', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// Update product (artisan only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product or is admin
    if (product.artisan.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('artisan', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product (artisan only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product or is admin
    if (product.artisan.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('artisan', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sort = 'newest' } = req.query;

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'az':
        sortObj = { title: 1 };
        break;
      case 'za':
        sortObj = { title: -1 };
        break;
      case 'pricehl':
        sortObj = { price: -1 };
        break;
      case 'pricelh':
        sortObj = { price: 1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({
      category,
      isActive: true
    })
      .populate('artisan', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      category,
      isActive: true
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q: searchQuery, page = 1, limit = 12, sort = 'newest' } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'az':
        sortObj = { title: 1 };
        break;
      case 'za':
        sortObj = { title: -1 };
        break;
      case 'pricehl':
        sortObj = { price: -1 };
        break;
      case 'pricelh':
        sortObj = { price: 1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({
      $text: { $search: searchQuery },
      isActive: true
    })
      .populate('artisan', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      $text: { $search: searchQuery },
      isActive: true
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        searchQuery,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts
}; 