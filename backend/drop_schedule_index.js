const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collection = mongoose.connection.db.collection('schedules');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    // Check if schedule_ID_1 exists
    const hasIndex = indexes.some(idx => idx.name === 'schedule_ID_1');
    
    if (hasIndex) {
      console.log('Dropping index schedule_ID_1...');
      await collection.dropIndex('schedule_ID_1');
      console.log('Index dropped successfully!');
    } else {
      console.log('Index schedule_ID_1 not found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropIndex();
