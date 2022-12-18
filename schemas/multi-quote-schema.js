const TagSchema = require('./tag-schema')
const mongoose = require('mongoose')

const Fragment = new mongoose.Schema({
    text: {
        type: String,
        minLength: 1,
        maxLength: 256
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
})

const MultiQuoteSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: [true, 'Must provide a guild id.'],
    },
    text: { // The title of the quote.
        type: String,
        maxLength: 4096,
        required: [true, 'Must provide a title.'],
    },
    fragments: [{
        type: Fragment,
    }],
    tags: [TagSchema],
    type: {
        type: String,
        required: [true, 'Must provide a type.'],
        enum: ['regular', 'multi', 'audio']
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

MultiQuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

module.exports = mongoose.model('multi', MultiQuoteSchema, 'quotes');
