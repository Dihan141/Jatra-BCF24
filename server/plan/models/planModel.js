const mongoose = require('mongoose');

const schema = mongoose.Schema;

const planSchema = schema({
    title: {
        type: String,
    },
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
    preferences: {
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
    },
    uid: {
        type: schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timeStamps: true
});

module.exports = mongoose.model('Plan', planSchema);