const mongoose = require('mongoose');

const AudioQuoteSchema = new mongoose.Schema({
    guildId: {
        type: String
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
    title: {
        type: String,
        required: [true, 'Must provide a title.']
    },
    audioFileLink: {
        type: String,
        required: [true, 'Must provide a title.']
    },
    tags: [{
        type: String,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }],
    isAudioQuote: {
        type: Boolean,
        default: true,
        index: true
    }
}, {timestamps: true});

AudioQuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setRunValidators);
    schema.pre('updateMany', setRunValidators);
    schema.pre('updateOne', setRunValidators);
    schema.pre('update', setRunValidators);
});

function setRunValidators() {
    this.setOptions({ runValidators: true });
}

module.exports = mongoose.model('quotes', AudioQuoteSchema);