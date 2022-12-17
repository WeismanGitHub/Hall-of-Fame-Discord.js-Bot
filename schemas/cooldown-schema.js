const mongoose = require('mongoose');

const CoolDownSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    command: { type: String, required: true },
    createdAt: { type: Date, expires: 60, default: new Date() }, //Lifetime == 60 seconds
    expirationDate: { type: Date, default: new Date().setSeconds(new Date().getSeconds() + 43200) }
});

module.exports = mongoose.model('cooldowns', CoolDownSchema);