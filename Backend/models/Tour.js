const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    tourId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    panoramas: {
        type: [Object],
        required: true
    },
    infospots: {
        type: [Object],
        required: true
    },
    linkspots: {
        type: [Object],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tour', tourSchema); 