const checkTags = require('../helpers/check-tags')
const checkURL = require('../helpers/check-url')
const TagSchema = require('./tag-schema')
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
        required: [true, 'Must provide a title.'],
        maxLength: 4096,
    },
    audioURL: {
        type: String,
        required: [true, 'Must provide an audio file link.'],
        maxLength: 512,
        validate: {
            validator: function(URL) { return (URL == null || checkURL(URL)) },
            message: props => `Invalid Input: \`${props.value}\``
        },
    },
    tags: [TagSchema],
    type: {
        type: String,
        default: 'audio',
        enum: ['audio']
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

AudioQuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

AudioQuoteSchema.pre('save', async function() {
    if (this.tags.length) {
        this.tags = await checkTags(this.tags, this.guildId);
    }
})

AudioQuoteSchema.pre('updateOne', async function(next) {
    const audioQuote = this.getUpdate()
    
    if (audioQuote.tags.length) {
        audioQuote.tags = await checkTags(audioQuote.tags, audioQuote.guildId);
    }

    next()
})

AudioQuoteSchema.pre('findOneAndUpdate', async function(next) {
    const audioQuote = this.getUpdate()

    if (audioQuote.tags.length) {
        audioQuote.tags = await checkTags(audioQuote.tags, audioQuote.guildId);
    }
    
    next()
})

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

module.exports = mongoose.model('audio quotes', AudioQuoteSchema, 'quotes');
