const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'inactive',
    },
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
