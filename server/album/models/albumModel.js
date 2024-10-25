const mongoose = require('mongoose');

const schema = mongoose.Schema;

const albumSchema = schema({
    photos: {
        type: Array,
        default: []
    },
    planId: {
        type: schema.Types.ObjectId,
        ref: 'Plan'
    }
});

module.exports = mongoose.model('Album', albumSchema);