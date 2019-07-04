const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongoose = require('mongoose')
const multer = require('multer')
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  //accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true)
};
var upload = multer({ storage: storage, fileFIlter: imageFilter})
// setting up cloudinary
const cloudinary = require ('cloudinary')
cloudinary.config({
  cloud_name: 'nairaland_clone',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')
const middlewareObj = require('../middlewares')

router.get("/:id", middlewareObj.isLoggedIn, (req, res) => {
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

router.get("/:id/follow", middlewareObj.isLoggedIn, (req, res) => {
const {id} = req.params
const {_id, username} = req.user
let newFollow = {_id, username}
User.findById(id, (err, foundUser) => {
  if (err) {
    console.log(err);
  } else {
foundUser.followers.push(newFollow)
foundUser.save()
  User.findById(req.user._id, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      user.followings.push(foundUser)
      user.save();
      req.flash('success', 'follow successful')
     res.redirect('back')
    }
  })
  }
})
})

router.get("/:id/unfollow", middlewareObj.isLoggedIn, (req, res) => {
  const {id} = req.params
  const {_id, username} = req.user
  const newFollow = {id, username}
  User.findById(id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      foundUser.followers.forEach((follower, index) => {
        if (follower == req.user.id) {
            foundUser.followers.splice(index, 1)
        }
    });
    foundUser.save();
    User.findById(req.user.id, (err, user) => {
      if (err) {
        console.log(err);
      } else {
       user.followings.forEach((following, count) => {
         if (following == id) {
           user.followings.splice(count, 1)
         }
       })
       user.save()
       req.flash('success', 'unfollow successful')
       res.redirect('back')
      }
    })
    }
  })
})

router.get("/:id/follower", middlewareObj.isLoggedIn, (req, res) => {
  User.findById(req.params.id).populate("followers").exec((err, user)=> { 
      if(err){
        req.flash('error', 'List not found')
        console.log(err);
      }else {
        console.log(user);
        res.render('user/follower', {user:user})
      }
    }) 
   })

  router.get("/:id/following", middlewareObj.isLoggedIn, (req, res) => {
    User.findById(req.params.id).populate("followings").exec((err, user)=> { 
        if(err){
          req.flash('error', 'List not found')
          console.log(err);
        }else {
          console.log(user);
          res.render('user/following', {user:user})
        }
      })
     })

//  //    route for image upload or change
//      router.post("/:id/photo", middlewareObj.isLoggedIn, upload.single('image'), (req, res) => {
//    cloudinary.uploader.upload(req.file.path,(result) => {
//      // add cloudinary url for the image to the photo under image property
//      req.body.photo = result.secure_url;
     
     
     
//    })
   
//     })
module.exports = router