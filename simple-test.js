const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGO_URI);

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      email: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    await testDoc.save();
    console.log('✅ Document saved successfully:', testDoc._id);
    
    const foundDoc = await TestModel.findOne({ email: 'test@example.com' });
    if (foundDoc) {
      console.log('✅ Document found successfully:', foundDoc.name);
    }
    
    await TestModel.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test document cleaned up');
    
    console.log('✅ All database operations working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testConnection(); 