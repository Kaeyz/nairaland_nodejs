const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: String,
    firstname: String,
    lastname: String,
    email: {type:String, unique: true, required: true},
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    followings: [{
        id :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"},
        username: String
    }],
    followers: [{
        id :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"},
        username: String
    }],
})

UserSchema.plugin(passportLocalMongoose)

module.exports= mongoose.model('User', UserSchema)