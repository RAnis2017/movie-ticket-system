// @/models.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    permissions: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    created_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updated_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    last_login: {
        type: Date,
        default: null,
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };