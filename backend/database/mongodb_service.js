const mongoose = require('mongoose');
const Recommendation = require('./models/Recommendation');

let isConnected = false;
const inMemoryStore = [];

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI set, running in in-memory mode.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.log('⚠️  MongoDB connection timed out. Running in in-memory store mode.');
    isConnected = false;
  }
}

async function saveRecommendation(data) {
  if (isConnected) {
    try {
      const doc = new Recommendation(data);
      return await doc.save();
    } catch (err) {
      console.error('Failed to save to MongoDB:', err.message);
    }
  }

  // In-Memory Fallback
  const record = { ...data, _id: Date.now().toString(), created_at: new Date() };
  inMemoryStore.unshift(record);
  return record;
}

async function getRecentRecommendations(limit = 10) {
  if (isConnected) {
    try {
      return await Recommendation.find().sort({ created_at: -1 }).limit(limit);
    } catch (err) {
      console.error('Failed to fetch from MongoDB:', err.message);
    }
  }
  return inMemoryStore.slice(0, limit);
}

module.exports = {
  connectDB,
  saveRecommendation,
  getRecentRecommendations
};
