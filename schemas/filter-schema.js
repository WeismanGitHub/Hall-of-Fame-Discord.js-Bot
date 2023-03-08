const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
    query: { type: Object },
    sort: { type: Object }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('filters', FilterSchema);