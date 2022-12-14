// @/models.js
const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true,
    },
    release_date: {
        type: Date,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        required: true,
    },
    trailer: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    actors: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image_urls: [{ type : String }],
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
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Movie = mongoose.model("Movie", MovieSchema);

module.exports = { Movie };