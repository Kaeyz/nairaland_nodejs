const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')
const middlewareObj = require('../middlewares')

router.get("/:id", (req, res) => {
    User.findById(req.params.id).populate("posts").populate("comments").exec((err, user)=> { 
        if(err){
          req.flash('error', 'User not found')
          console.log(err);
        }else {
          console.log(user);
          res.render('user/dashboard', {user:user})
        }
      })
     });



module.exports = router