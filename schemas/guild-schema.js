const checkURL = require('../helpers/check-url')
const TagSchema = require('./tag-schema')
const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Must provide a name."],
        minlength: 1,
        maxlength: 256,
    },
    iconURL: {
        type: String,
        minLength: 1,
        maxLength: 512,
        default: null,
        validate: {
            validator: function(URL) { return (URL == null || checkURL(URL)) },
            message: props => `Invalid Input: \`${props.value}\``
        },
    },
    type: {
        type: String,
        default: 'regular',
        enum: ['regular', 'discord']
    },
    discordId: {
        type: String,
        default: null,
    }
});

const GuildSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    authors: [AuthorSchema],
    tags: [TagSchema],
    notifications: {
        type: Boolean,
        default: true,
    },
    notificationChannelId: {
        type: String
    },
    quotesChannelId: {
        type: String,
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