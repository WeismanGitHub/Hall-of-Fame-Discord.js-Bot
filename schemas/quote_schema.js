const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    guildId: {
        type: String,
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
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

QuoteSchema.index({ guildId: 1, authorId: 1 });

module.exports = mongoose.model('regular quotes', QuoteSchema, 'quotes');
