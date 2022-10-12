const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    guildId: {
        type: String,
        index: true
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
        index: true
    },
    tags: [{
        type: String,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }],
    text: {
        type: String,
        minLength: 1,
        maxLength: 256
    },
    attachment: {
        type: String,
        minLength: 1,
        maxLength: 256,
    },
    isAudioQuote: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

QuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

module.exports = mongoose.model('regular quotes', QuoteSchema, 'quotes');
