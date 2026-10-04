const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connection successful: ${conn.connection.host} (Database: ${conn.connection.name})`);
    } catch (error) {
        console.log("MongoDB connection failed: " + error);
        process.exit(1);
    }
};

module.exports = connectDB;