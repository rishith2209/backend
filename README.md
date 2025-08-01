# Crochet ArtY Backend API

A robust Express.js backend for the Crochet ArtY e-commerce platform, built with Node.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for handmade products
- **Shopping Cart**: Complete cart functionality with validation
- **Artisan Dashboard**: Analytics and product management for artisans
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: Rate limiting, CORS, and security headers

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env.example` to `config.env`
   - Update the configuration values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crochet_arty
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&category=Crochet Arts&sort=newest
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Artisan Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Handmade Crochet Bag",
  "description": "Beautiful handmade crochet bag",
  "price": 45.99,
  "category": "Crochet Arts",
  "images": ["https://example.com/image1.jpg"],
  "stock": 10
}
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

### Artisan Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /api/artisan/dashboard/stats
Authorization: Bearer <token>
```

#### Get Artisan Products
```http
GET /api/artisan/products?page=1&limit=10&status=active
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **customer**: Can browse products, manage cart, place orders
- **artisan**: Can manage products, view analytics, update profile
- **admin**: Full access to all features

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer/artisan/admin),
  phone: String,
  address: Object,
  isVerified: Boolean,
  isActive: Boolean,
  artisanProfile: Object
}
```

### Product Schema
```javascript
{
  title: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  artisan: ObjectId (ref: User),
  stock: Number,
  isActive: Boolean,
  isFeatured: Boolean
}
```

### Cart Schema
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  totalItems: Number
}
```

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with token expiration
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers for protection

## 🔧 Error Handling

All errors are handled centrally with consistent response format:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## 📝 Validation

The API includes comprehensive validation for:

- User registration and login
- Product creation and updates
- Cart operations
- Profile updates

## 🚀 Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Use environment variables for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 