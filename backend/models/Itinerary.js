const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    destination: String,
    days: Number,
    activities: [{
        day: Number,
        time: String,
        description: String
    }]
});

module.exports = mongoose.model('Itinerary', itinerarySchema);