const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must provide a name.\n(Probably a server error.)'],
        minlength: 1,
        maxlength: 50,
        unique: true,
    },
    imgUrl: {
        type: String,
        required: [true, 'Must provide a url.\n(Probably a server error.)']
    }
});

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: [true, 'Must provide a name.\n(Probably a server error.)'],
        unique: true,
    },
    authors: [AuthorSchema],
    tags: [{
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }]
});

GuildSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setRunValidators);
    schema.pre('updateMany', setRunValidators);
    schema.pre('updateOne', setRunValidators);
    schema.pre('update', setRunValidators);
});

function setRunValidators() {
    this.setOptions({ runValidators: true });
}

module.exports = mongoose.model('guilds', GuildSchema);