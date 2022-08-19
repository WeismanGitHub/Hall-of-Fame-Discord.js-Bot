const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
    queryObject: { type: Object },
    sortObject: { type: Object},
    createdAt: { type: Date, expires: 1800, default: new Date() }
});

module.exports = mongoose.model('filters', FilterSchema);