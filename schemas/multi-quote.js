const mongoose = require('mongoose');

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

const MultiQuote = new mongoose.Schema({
    guildId: {
        type: String,
    },
    fragments: [{
        type: Fragment,
        min: 2,
        max: 10
    }],
    tags: [{
        type: String,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }],
}, { timestamps: true });

MultiQuote.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true, new: true });
}

MultiQuote.index({ guildId: 1 });

module.exports = mongoose.model('multi_author_quotes', MultiQuote);
