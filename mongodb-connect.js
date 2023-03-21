const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 50,
            wtimeoutMS: 2500,
            useNewUrlParser: true
        })

        console.log('connected to database...')
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB