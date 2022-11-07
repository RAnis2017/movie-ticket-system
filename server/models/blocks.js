// @/models.js
const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Content: {
        type: String,
    },
    order: {
        type: Number,
        required: true,
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

const Block = mongoose.model("Block", BlockSchema);

module.exports = { Block };