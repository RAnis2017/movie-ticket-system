// @/models.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
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
    },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = { Category };