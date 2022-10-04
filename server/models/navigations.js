// @/models.js
const mongoose = require("mongoose");

const NavigationSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    URL : {
        type: String,
        required: true
    },
    _target: {
        type: String,
        required: true,
    },
    parentID: {
        type: String,
        required: true,
        ref: 'Navigation'
    },
    created_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updated_date: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

const Navigation = mongoose.model("Navigation", NavigationSchema);

module.exports = { Navigation };