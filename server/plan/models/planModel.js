const mongoose = require('mongoose');

const schema = mongoose.Schema;

const planSchema = schema({
    place: {
        type: String,
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date,
        required: true
    },
    preference: {
        type: String,
        required: true
    },
    peopleCount: {
        type: Number,
        required: true
    },
    attractions: {
        type: Array,
        default: []
    },
    hotels: {
        type: Array,
        default: []
    },
    restaurants: {
        type: Array,
        default: []
    }
},{
    timeStamps: true
});

module.exports = mongoose.model('Plan', planSchema);