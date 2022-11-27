const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
    query: { type: Object },
    sort: { type: Object},
    createdAt: { type: Date, expires: 21600, default: new Date() } //Lifetime == 6 hours
});

module.exports = mongoose.model('filters', FilterSchema);