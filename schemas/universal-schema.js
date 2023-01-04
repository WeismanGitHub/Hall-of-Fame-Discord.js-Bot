// Only use for querying. You need a schema with every property to do queries in the collection. Because multi quotes and all other quotes have differences in authors, you can't search the quotes collection for authors.

const TagSchema = require('./tag-schema')
const mongoose = require('mongoose');

const Fragment = new mongoose.Schema({
    text: {
        type: String,
        minLength: 1,
        maxLength: 819, // A fifth of 4096, the desciption limit of embeds.
        required: [true, 'Must provide text.']
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
}, { _id : false })

const UniversalQuoteSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: [true, 'Must provide a guild id.'],
    },
    text: { // The title of the quote.
        type: String,
        minLength: 1,
        maxLength: 256,
        required: [true, 'Must provide a title.'],
    },
    fragments: [Fragment],
    tags: [TagSchema],
    type: {
        type: String,
        default: 'multi',
        enum: ['multi']
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('universal', UniversalQuoteSchema, 'quotes');
