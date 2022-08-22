// @/models.js
const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
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

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = { Permission };