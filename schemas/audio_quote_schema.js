const mongoose = require('mongoose');

const AudioQuoteSchema = new mongoose.Schema({
    guildId: {
        type: String
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
    text: {
        type: String,
        required: [true, 'Must provide a title.']
    },
    audioFileLink: {
        type: String,
        required: [true, 'Must provide an audio file link.']
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
    }
}, {timestamps: true});

AudioQuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

module.exports = mongoose.model('audio quotes', AudioQuoteSchema, 'quotes');
