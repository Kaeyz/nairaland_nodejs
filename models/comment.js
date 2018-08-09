const mongoose = require('mongoose')


const commentSchema =  new mongoose.Schema({
    body: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
  });

  module.exports = mongoose.model('Comment', commentSchema);