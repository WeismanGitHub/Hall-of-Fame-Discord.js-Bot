const mongoose = require('mongoose');

const MultiAuthorQuote = new mongoose.Schema({
    guildId: {
        type: String,
    },
    fragments: [{
        text: {
            type: String,
            minLength: 1,
            maxLength: 256
        },
        authorId: {
            type: mongoose.Types.ObjectId,
            required: [true, 'Must provide a valid author.'],
        },
    }],
    tags: [{
        type: String,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }],
}, { timestamps: true });

MultiAuthorQuote.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

MultiAuthorQuote.index({ guildId: 1 });

module.exports = mongoose.model('multi_author_quotes', MultiAuthorQuote);
