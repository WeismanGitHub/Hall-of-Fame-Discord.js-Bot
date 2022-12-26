const checkTags = require('../helpers/check-tags')
const TagSchema = require('./tag-schema')
const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    guildId: {
        type: String,
        minLength: 1,
        required: [true, 'Must provide a guild id.'],
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Must provide a valid author.'],
    },
    tags: [TagSchema],
    text: {
        type: String,
        minLength: 1,
        maxLength: 4096,
        default: null
    },
    attachmentURL: {
        type: String,
        minLength: 1,
        maxLength: 512,
        default: null
    },
    type: {
        type: String,
        default: 'regular',
        enum: ['regular']
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

QuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

QuoteSchema.pre('save', async function() {
    if (!this.attachmentURL && !this.text) {
        throw new InvalidInputError('Must have text or an attachment URL or both.')
    }

    this.tags = await checkTags(this.tags, this.guildId);
})

QuoteSchema.pre('updateOne', async function(next) {
    const quote = this.getUpdate()

    if (!quote.attachmentURL && !quote.text) {
        throw new InvalidInputError('Must have text or an attachment URL or both.')
    }
    
    quote.tags = await checkTags(quote.tags, quote.guildId);

    next()
})

QuoteSchema.pre('findOneAndUpdate', async function(next) {
    const quote = this.getUpdate()
    
    if (!quote.attachmentURL && !quote.text) {
        throw new InvalidInputError('Must have text or an attachment URL or both.')
    }

    quote.tags = await checkTags(quote.tags, quote.guildId);
    
    next()
})

QuoteSchema.index({ guildId: 1, text: 'text' });
QuoteSchema.index({ guildId: 1 });

module.exports = mongoose.model('regular quotes', QuoteSchema, 'quotes');
