const mongoose = require('mongoose');

const CoolDownSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    command: { type: String, required: true },
    createdAt: { type: Date, expires: 43200, default: new Date() }, //Lifetime == 12 hours
    expirationDate: { type: Date, default: new Date().setSeconds(new Date().getSeconds() + 43200) }
});

module.exports = mongoose.model('cooldowns', CoolDownSchema);