// @/models.js
const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
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

const Tracking = mongoose.model("Tracking", TrackingSchema);

module.exports = { Tracking };