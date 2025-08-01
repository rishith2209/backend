const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Artisan is required']
    }
}, {
    timestamps: true
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card', 'upi', 'wallet'],
        default: 'cod'
    },
    shippingAddress: {
        name: {
            type: String,
            required: [true, 'Shipping name is required']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required']
        },
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required']
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    estimatedDelivery: {
        type: Date
    },
    actualDelivery: {
        type: Date
    },
    trackingNumber: {
        type: String
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
orderSchema.index({ customer: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    try {
        if (!this.orderNumber) {
            // Use this.constructor instead of mongoose.model to avoid circular reference
            const count = await this.constructor.countDocuments();
            this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(3, '0')}`;
        }

        // Set estimated delivery (5-7 business days from now)
        if (!this.estimatedDelivery) {
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            this.estimatedDelivery = deliveryDate;
        }

        next();
    } catch (error) {
        console.error('Order pre-save error:', error);
        next(error);
    }
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function () {
    return this.totalAmount ? `₹${this.totalAmount.toFixed(2)}` : '₹0.00';
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function () {
    if (!this.createdAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);