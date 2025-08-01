const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Sample data
const sampleUsers = [
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+91-9876543210',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'Sarah Artisan',
    email: 'artisan@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '+91-9876543211',
    address: {
      street: '456 Craft Lane',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    artisanProfile: {
      bio: 'Passionate crochet artist with 5 years of experience creating beautiful handmade items.',
      specialties: ['Crochet Arts', 'Handmade Toys'],
      experience: 5,
      socialLinks: {
        instagram: '@sarahcrafts',
        facebook: 'sarah.crafts',
        website: 'www.sarahcrafts.com'
      }
    }
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+91-9876543212',
    address: {
      street: '789 Admin Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  }
];

const sampleProducts = [
  {
    title: 'Crochet Teddy Bear',
    description: 'Handmade soft teddy bear, perfect for gifts. Made with premium yarn and filled with hypoallergenic stuffing.',
    price: 25,
    category: 'Handmade Toys',
    images: ['https://m.media-amazon.com/images/I/71PHD2hCG8L._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 10,
    isActive: true,
    isFeatured: true,
    tags: ['teddy', 'soft', 'gift'],
    materials: ['Premium yarn', 'Hypoallergenic stuffing'],
    careInstructions: 'Hand wash only, air dry'
  },
  {
    title: 'Colorful Coasters',
    description: 'Set of 4 vibrant crochet coasters. Perfect for protecting your table while adding a pop of color.',
    price: 12,
    category: 'Crochet Arts',
    images: ['https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/aabe853c-437e-4591-bd84-60193f08a7c6._CR0,2338,4912,2572_SX810_CB1169409_QL70_.jpg'],
    stock: 25,
    isActive: true,
    isFeatured: true,
    tags: ['coasters', 'colorful', 'home decor'],
    materials: ['Cotton yarn', 'Non-slip backing'],
    careInstructions: 'Wipe clean with damp cloth'
  },
  {
    title: 'Boho Wall Hanging',
    description: 'Bohemian style wall decor for your home. Handcrafted with love and attention to detail.',
    price: 40,
    category: 'Handmade Decors',
    images: ['https://m.media-amazon.com/images/I/81AfHzCTReL._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 8,
    isActive: true,
    isFeatured: false,
    tags: ['wall hanging', 'boho', 'decor'],
    materials: ['Macrame cord', 'Wooden dowel'],
    careInstructions: 'Dust regularly, avoid direct sunlight'
  },
  {
    title: 'Crochet Basket',
    description: 'Sturdy and stylish storage basket. Perfect for organizing your home with a handmade touch.',
    price: 18,
    category: 'Crochet Arts',
    images: ['https://m.media-amazon.com/images/I/71PHD2hCG8L._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 15,
    isActive: true,
    isFeatured: false,
    tags: ['basket', 'storage', 'organizer'],
    materials: ['Jute yarn', 'Stiffener'],
    careInstructions: 'Wipe clean, air dry'
  },
  {
    title: 'Mini Plant Pot Cover',
    description: 'Cute cover for your mini plant pots. Adds personality to your indoor garden.',
    price: 10,
    category: 'Handmade Decors',
    images: ['https://m.media-amazon.com/images/I/51-HJHIjejL._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 30,
    isActive: true,
    isFeatured: false,
    tags: ['plant', 'pot cover', 'garden'],
    materials: ['Cotton yarn', 'Waterproof lining'],
    careInstructions: 'Hand wash, air dry'
  },
  {
    title: 'Crochet Earrings',
    description: 'Lightweight, handmade earrings. Perfect accessory for any outfit.',
    price: 15,
    category: 'Crochet Arts',
    images: ['https://m.media-amazon.com/images/I/61D7IZQe0kL._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 20,
    isActive: true,
    isFeatured: false,
    tags: ['earrings', 'accessory', 'lightweight'],
    materials: ['Fine cotton yarn', 'Sterling silver hooks'],
    careInstructions: 'Store in jewelry box, avoid water'
  },
  {
    title: 'Rainbow Keychain',
    description: 'Brighten your keys with this cute keychain. Handmade with colorful yarn.',
    price: 8,
    category: 'Crochet Arts',
    images: ['https://m.media-amazon.com/images/I/51toz9bNU8L._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 50,
    isActive: true,
    isFeatured: false,
    tags: ['keychain', 'rainbow', 'colorful'],
    materials: ['Acrylic yarn', 'Metal ring'],
    careInstructions: 'Wipe clean as needed'
  },
  {
    title: 'Crochet Pouch',
    description: 'Handy pouch for coins or cosmetics. Perfect size for essentials.',
    price: 20,
    category: 'Dresses',
    images: ['https://m.media-amazon.com/images/I/4142jKEPQeL._AC_UL480_FMwebp_QL65_.jpg'],
    stock: 12,
    isActive: true,
    isFeatured: false,
    tags: ['pouch', 'cosmetics', 'organizer'],
    materials: ['Cotton yarn', 'Zipper'],
    careInstructions: 'Hand wash, air dry'
  }
];

const staticProducts = [
  { title: 'Crochet Teddy Bear', price: 25, images: ['images/id1.jpg'], description: 'Handmade soft teddy bear, perfect for gifts.', category: 'Handmade Toys' },
  { title: 'Colorful Coasters', price: 12, images: ['https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/aabe853c-437e-4591-bd84-60193f08a7c6._CR0,2338,4912,2572_SX810_CB1169409_QL70_.jpg'], description: 'Set of 4 vibrant crochet coasters.', category: 'Crochet Arts' },
  { title: 'Boho Wall Hanging', price: 40, images: ['https://m.media-amazon.com/images/I/81AfHzCTReL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Bohemian style wall decor for your home.', category: 'Handmade Decors' },
  { title: 'Crochet Basket', price: 18, images: ['https://m.media-amazon.com/images/I/71PHD2hCG8L._AC_UL480_FMwebp_QL65_.jpg'], description: 'Sturdy and stylish storage basket.', category: 'Crochet Arts' },
  { title: 'Mini Plant Pot Cover', price: 10, images: ['https://m.media-amazon.com/images/I/51-HJHIjejL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Cute cover for your mini plant pots.', category: 'Handmade Decors' },
  { title: 'Crochet Earrings', price: 15, images: ['https://m.media-amazon.com/images/I/61D7IZQe0kL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Lightweight, handmade earrings.', category: 'Crochet Arts' },
  { title: 'Rainbow Keychain', price: 8, images: ['https://m.media-amazon.com/images/I/51toz9bNU8L._AC_UL480_FMwebp_QL65_.jpg'], description: 'Brighten your keys with this cute keychain.', category: 'Crochet Arts' },
  { title: 'Crochet Pouch', price: 20, images: ['https://m.media-amazon.com/images/I/4142jKEPQeL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Handy pouch for coins or cosmetics.', category: 'Dresses' },
  { title: 'Abstract Canvas', price: 60, images: ['https://m.media-amazon.com/images/I/81Z1jn5ol+L._AC_UL480_FMwebp_QL65_.jpg'], description: 'Modern abstract art for your wall.', category: 'Abstract Arts' },
  { title: 'Sunset Painting', price: 55, images: ['https://m.media-amazon.com/images/I/61JwLPhc2bL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Hand-painted sunset landscape.', category: 'Paintings' },
  { title: 'Kondapalli Bomma - Elephant', price: 150, images: ['https://m.media-amazon.com/images/I/41voJJpJxPL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Traditional Kondapalli wooden elephant doll.', category: 'Handmade Toys' },
  { title: 'Kondapalli Bomma - Dancing Lady', price: 180, images: ['https://m.media-amazon.com/images/I/61ITGK2AlbL._AC_UL480_FMwebp_QL65_.jpg'], description: 'Colorful Kondapalli dancing lady doll.', category: 'Handmade Toys' }
];

// Connect to database
async function connectDB() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Seed users
async function seedUsers() {
  try {
    console.log('👥 Seeding users...');
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.role})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.name}`);
      }
    }
    
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Seed products
async function seedProducts() {
  try {
    console.log('🛍️  Seeding products...');
    
    // Get artisan user
    const artisan = await User.findOne({ role: 'artisan' });
    if (!artisan) {
      console.log('❌ No artisan user found. Please seed users first.');
      return;
    }
    
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ 
        title: productData.title,
        artisan: artisan._id 
      });
      
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          artisan: artisan._id
        });
        await product.save();
        console.log(`✅ Created product: ${productData.title}`);
      } else {
        console.log(`⏭️  Product already exists: ${productData.title}`);
      }
    }
    
    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

async function seedStaticProducts() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  for (const prod of staticProducts) {
    await Product.updateOne(
      { title: prod.title },
      {
        $setOnInsert: {
          ...prod,
          stock: 50,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
  console.log('Static products seeded!');
  await mongoose.disconnect();
}

// Main seeding function
async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedProducts();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Customer: customer@example.com / password123');
    console.log('Artisan: artisan@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase(); 