// @/models.js
const mongoose = require("mongoose");

const LikesDislikesSchema = new mongoose.Schema({
    liked: {
        type: Boolean,
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

const LikeDislike = mongoose.model("LikeDislike", LikesDislikesSchema);

module.exports = { LikeDislike };