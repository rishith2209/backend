const axios = require('axios');

const BASE_URL = 'https://bacend-6rm4.onrender.com';

async function testAPI() {
  console.log('🧪 Testing Crochet ArtY API...\n');
  
  try {
    // Test root endpoint
    console.log('1. Testing root endpoint (/)...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint:', rootResponse.data);
    
    // Test health endpoint
    console.log('\n2. Testing health endpoint (/api/health)...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint:', healthResponse.data);
    
    // Test products endpoint
    console.log('\n3. Testing products endpoint (/api/products)...');
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log('✅ Products endpoint status:', productsResponse.status);
    
    console.log('\n🎉 All tests passed! Your API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testAPI(); 