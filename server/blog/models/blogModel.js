const { text } = require('express');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

const blogSchema = schema({
    tripName: {
        type: String,
        required: true
    },
    text: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
});

module.exports = mongoose.model('Blog', blogSchema);