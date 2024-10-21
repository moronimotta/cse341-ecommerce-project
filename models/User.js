const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    role: {
        type: String,
        enum: ['admin', 'customer', 'manager'],
        required: true,
    },
    api_key: {
        type: String,
        default: uuidv4(),
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Boolean,
        default: true,
    },
    // store_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Store',
    //     required: true,
    // },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
