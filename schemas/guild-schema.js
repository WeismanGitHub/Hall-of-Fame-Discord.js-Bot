const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must provide a name.\n(Probably a server error.)'],
        minlength: 1,
        maxlength: 50,
    },
    imgUrl: {
        type: String,
        required: [true, 'Must provide a url.\n(Probably a server error.)']
    }
});

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: [true, 'Must provide a guildId.\n(Probably a server error.)'],
        unique: true,
    },
    authors: [AuthorSchema],
    tags: [{
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 50,
        collation: { locale: 'en', strength: 2 },
    }],
    notifications: {
        type: Boolean,
        default: true,
    },
    notificationChannelId: {
        type: String
    },
    quotesChannelId: {
        type: String
    }
});

GuildSchema.plugin(schema => {
    schema.pre('findOneAndUpdate', setOptions);
    schema.pre('updateMany', setOptions);
    schema.pre('updateOne', setOptions);
    schema.pre('update', setOptions);
});

function setOptions() {
    this.setOptions({ runValidators: true });
}

module.exports = mongoose.model('guilds', GuildSchema);