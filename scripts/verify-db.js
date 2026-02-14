const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = "mongodb://localhost:27017/learnify";

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) {
        MONGODB_URI = match[1].trim();
    }
}

async function verifyDB() {
    try {
        console.log(`Checking connection to: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Successfully connected to MongoDB!");

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("\n📂 Collections found:");
        if (collections.length === 0) {
            console.log("   (No collections found - DB might be empty. Try signing up on the app first!)");
        } else {
            collections.forEach(c => console.log(`   - ${c.name}`));
        }

        // Check specific counts
        // We need to define schema-less models just to count
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();

        console.log("\n📊 Quick Stats:");
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Courses: ${courseCount}`);

    } catch (error) {
        console.error("❌ Connection failed. Check db-error.log for details.");
        fs.writeFileSync(path.join(__dirname, '..', 'db-error.log'), error.stack || error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected.");
    }
}

verifyDB();
