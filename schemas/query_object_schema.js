const mongoose = require('mongoose');

const QueryAndSortObjectsSchema = new mongoose.Schema({
    queryObject: { type: Object },
    sortObject: { type: Object},
});

QueryAndSortObjectsSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setRunValidators);
    schema.pre('updateMany', setRunValidators);
    schema.pre('updateOne', setRunValidators);
    schema.pre('update', setRunValidators);
});

function setRunValidators() {
    this.setOptions({ runValidators: true });
}

module.exports = mongoose.model('query/sort objects', QueryAndSortObjectsSchema);