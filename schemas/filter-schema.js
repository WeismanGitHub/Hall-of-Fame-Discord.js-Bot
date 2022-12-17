const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
    query: { type: Object },
    sort: { type: Object},
    createdAt: { type: Date, expires: 60, default: new Date() } //Lifetime == 60 seconds
});

module.exports = mongoose.model('filters', FilterSchema);