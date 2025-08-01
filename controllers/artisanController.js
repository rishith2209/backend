const Product = require('../models/Product');
const User = require('../models/User');

// Get artisan dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const artisanId = req.user._id;

    // Get product counts
    const totalProducts = await Product.countDocuments({ artisan: artisanId });
    const activeProducts = await Product.countDocuments({ 
      artisan: artisanId, 
      isActive: true 
    });
    const featuredProducts = await Product.countDocuments({ 
      artisan: artisanId, 
      isFeatured: true 
    });

    // Get recent products
    const recentProducts = await Product.find({ artisan: artisanId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price isActive createdAt');

    // Calculate total value of products
    const products = await Product.find({ artisan: artisanId });
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    // Get category distribution
    const categoryStats = await Product.aggregate([
      { $match: { artisan: artisanId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          featuredProducts,
          totalValue
        },
        recentProducts,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// Get artisan's products with pagination
const getArtisanProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, sort = 'newest' } = req.query;
    const artisanId = req.user._id;

    // Build filter
    const filter = { artisan: artisanId };
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Build sort
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

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

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
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Update product status (active/inactive)
const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    product.isActive = isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { product }
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

// Update product featured status
const updateProductFeatured = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isFeatured } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    product.isFeatured = isFeatured;
    await product.save();

    res.json({
      success: true,
      message: `Product ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { product }
    });
  } catch (error) {
    console.error('Update product featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product featured status'
    });
  }
};

// Get artisan profile
const getArtisanProfile = async (req, res) => {
  try {
    const artisan = await User.findById(req.user._id)
      .select('-password');

    res.json({
      success: true,
      data: { artisan }
    });
  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan profile'
    });
  }
};

// Update artisan profile
const updateArtisanProfile = async (req, res) => {
  try {
    const { name, phone, address, artisanProfile } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (artisanProfile) updateData.artisanProfile = artisanProfile;

    const artisan = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Get artisan analytics
const getArtisanAnalytics = async (req, res) => {
  try {
    const artisanId = req.user._id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get products created in the period
    const productsCreated = await Product.countDocuments({
      artisan: artisanId,
      createdAt: { $gte: startDate }
    });

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { artisan: artisanId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get price range distribution
    const priceRanges = await Product.aggregate([
      { $match: { artisan: artisanId } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $lt: ['$price', 100] },
              then: 'Under ₹100',
              else: {
                $cond: {
                  if: { $lt: ['$price', 500] },
                  then: '₹100-₹500',
                  else: {
                    $cond: {
                      if: { $lt: ['$price', 1000] },
                      then: '₹500-₹1000',
                      else: 'Above ₹1000'
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get stock status
    const stockStatus = await Product.aggregate([
      { $match: { artisan: artisanId } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$stock', 0] },
              then: 'Out of Stock',
              else: {
                $cond: {
                  if: { $lt: ['$stock', 5] },
                  then: 'Low Stock',
                  else: 'In Stock'
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        productsCreated,
        categoryDistribution,
        priceRanges,
        stockStatus
      }
    });
  } catch (error) {
    console.error('Get artisan analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

module.exports = {
  getDashboardStats,
  getArtisanProducts,
  updateProductStatus,
  updateProductFeatured,
  getArtisanProfile,
  updateArtisanProfile,
  getArtisanAnalytics
}; 