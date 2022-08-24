// @/models.js
const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
    setting_type: {
        type: String,
        required: true,
    },
    options: {
        type: Object,
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

const Setting = mongoose.model("Setting", SettingSchema);

module.exports = { Setting };