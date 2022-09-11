// @/models.js
const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email : {
        type: String,
        required: true
    },
    seats_count: {
        type: Number,
        required: true,
    },
    movieID: {
        type: String,
        required: true,
        ref: 'Movie'
    },
    seats: [{ type : String }],
    total_price: {
        type: Number,
        required: true,
    },
    created_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    updated_date: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = { Ticket };