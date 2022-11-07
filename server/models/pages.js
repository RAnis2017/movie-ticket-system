// @/models.js
const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Slug : {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true,
    },
    Image: {
        type: String,
        required: true,
    },
    parentID: {
        type: String,
        required: true,
        ref: 'Page'
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

const Page = mongoose.model("Page", PageSchema);

module.exports = { Page };