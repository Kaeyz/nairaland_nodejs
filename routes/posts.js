const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')
const middlewareObj = require('../middlewares/index')

// Route to render Post
router.get("/", (req, res) => {
    Post.find({}, function (err, posts) {
      if (err) {
        req.flash('error', 'Database Error')
      } else {
        res.render("home", {posts});
      }
    }).sort({"createdAt": -1})
  });

  // get router for newpost page render
  router.get("/new", middlewareObj.isLoggedIn, (req, res) => {
    res.render("post/new_post");
  });
  
  router.post("/new",  middlewareObj.isLoggedIn, (req, res) => {
    const {title,post} = req.body;
    const {id, username} = req.user;
    const author = {id, username}
    Post.create({
        title,
        post, 
        author,
      },
      (err, newPost) => {
        if (err) {
          req.flash('error', 'Cannot create post. Check connection and try again.')
          console.error(err);
        } else {
          User.findById({_id: id}, (err, user) => {
          if (err) {
            console.log(err);
          }  else {
            user.posts.push(newPost._id)
            user.save()
            req.flash('success', 'Successful. Post created.')
            res.redirect("/");
          }
          })
        }
      }
    );
  });  

  // Route to show Post
  router.get("/:id", (req, res) => {
   Post.findById(req.params.id).populate("comments").exec((err, post)=> {
     if(err){
       req.flash('error', 'Post not find')
       console.log(err);
     }else {
       console.log(post);
       res.render('post/show_post', {post:post})
     }
   })
  });
  
  // Route for Update posts
  router.get("/:id/update", middlewareObj.checkPostOwnership,(req, res) => {
    Post.findById({
        _id: req.params.id
      },
      function (err, foundPost) {
        if (err) {
          req.flash('error', 'Post not found')
          console.log(err);
        } else {
          console.log({
            foundPost
          });
          res.render("post/update_post", {
            post: foundPost
          });
        }
      }
    );
  });
  
  //route for update button
  router.put("/:id/update",middlewareObj.checkPostOwnership, (req, res) => {
    let id = req.params.id
    let post = req.body.post;
    Post.findByIdAndUpdate(id, post, function (err, updatedPost) {
      if (err) {
        req.flash('error', 'err.message')
        console.log(err)
      } else {
       req.flash('success', 'Sucessful! Post updated')
        res.redirect(`/post/${id}`);
  
      }
    })
  })
  
  // Route for Post Delete
  router.get("/:id/delete", middlewareObj.checkPostOwnership,(req, res) => {
    Post.findById({
      _id: req.params.id
    },
    function (err, foundPost) {
      if (err) {
        req.flash('error', 'Post not found')
        console.log(err);
      } else {
        console.log({
          foundPost
        });
    res.render("post/delete_post",  {
      post: foundPost
    });
  }
}
);
  });
  
  router.delete("/:id/delete", middlewareObj.checkPostOwnership, (req, res) => {
    let id = req.params.id;
    Post.findByIdAndRemove({
      _id: id
    }, function (err) {
      if (err) {
        req.flash('error', 'Error deleting post. Try again')
        console.log("delete not successful");
      } else {
    req.flash('success', 'post sucessfully deleted')
        res.redirect("/");
      }
    });
  });

  module.exports = router