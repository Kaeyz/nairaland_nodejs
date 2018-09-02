const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: String,
    firstname: String,
    lastname: String,
    email: {type:String, unique: true, required: true},
    photo: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false},
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    followings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"}
        ],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
})

UserSchema.plugin(passportLocalMongoose)

module.exports= mongoose.model('User', UserSchema)