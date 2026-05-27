const mongoose = require("mongoose");

const GuildDataSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    rangos: {
        type: [String],
        default: []
    },

    messageId: {
        type: String,
        default: null
    },

    channelId: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model("GuildData", GuildDataSchema);