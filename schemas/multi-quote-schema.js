const { InvalidInputError } = require('../errors');
const checkTags = require('../helpers/check-tags');
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
})

const MultiQuoteSchema = new mongoose.Schema({
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
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

MultiQuoteSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

MultiQuoteSchema.pre('save', async function() {
    const length = this.fragments.length

    if (length < 2 || length > 5) {
        throw new InvalidInputError('Must have between 2 and 5 fragments.')
    }

    if (this.tags.length) {
        this.tags = await checkTags(this.tags, this.guildId);
    }

})

MultiQuoteSchema.pre('updateOne', async function(next) {
    const multiQuote = this.getUpdate()
    const length = multiQuote.fragments.length

    if (length < 2 || length > 5) {
        throw new InvalidInputError('Must have between 2 and 5 fragments.')
    }
    
    if (multiQuote.tags.length) {
        multiQuote.tags = await checkTags(multiQuote.tags, multiQuote.guildId);
    }

    next()
})

MultiQuoteSchema.pre('findOneAndUpdate', async function(next) {
    const multiQuote = this.getUpdate()
    const length = multiQuote.fragments.length

    if (length < 2 || length > 5) {
        throw new InvalidInputError('Must have between 2 and 5 fragments.')
    }
    
    if (multiQuote.tags.length) {
        multiQuote.tags = await checkTags(multiQuote.tags, multiQuote.guildId);
    }

    next()
})
function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

module.exports = mongoose.model('multi', MultiQuoteSchema, 'quotes');
