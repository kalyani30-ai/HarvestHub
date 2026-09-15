const http = require('http');

// Test customer login
function testCustomerLogin() {
  const postData = JSON.stringify({
    email: 'customer@test.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/customers/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Customer Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('✅ Customer Login Successful!');
          console.log('Token:', response.token);
          console.log('User:', response.customer.name);
        } else {
          console.log('❌ Customer Login Failed:', response.message);
        }
      } catch (e) {
        console.log('❌ Error parsing response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Customer Login Error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test farmer login
function testFarmerLogin() {
  const postData = JSON.stringify({
    email: 'farmer@test.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/farmers/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Farmer Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('✅ Farmer Login Successful!');
          console.log('Token:', response.token);
          console.log('User:', response.farmer.name);
        } else {
          console.log('❌ Farmer Login Failed:', response.message);
        }
      } catch (e) {
        console.log('❌ Error parsing response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Farmer Login Error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test server connection
function testServerConnection() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Server Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Server Response:', data);
    });
  });

  req.on('error', (e) => {
    console.log('❌ Server Connection Error:', e.message);
  });

  req.end();
}

console.log('🚀 Testing Login Functionality');
console.log('================================');

// Test server connection first
console.log('\n1. Testing server connection...');
testServerConnection();

// Wait a bit and test customer login
setTimeout(() => {
  console.log('\n2. Testing customer login...');
  testCustomerLogin();
}, 1000);

// Wait a bit and test farmer login
setTimeout(() => {
  console.log('\n3. Testing farmer login...');
  testFarmerLogin();
}, 2000); 