const express = require('express');
const router = express.Router({mergeParams: true});
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')
const middlewareObj = require('../middlewares/index')

// comment route
router.post("/", middlewareObj.isLoggedIn, (req, res) => {
  const {id} = req.params
  const {comment} = req.body
  Post.findById(id, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      Comment.create(comment, (err, comment) => {
        if (err) {
          req.flash('error', 'error creating comment. Check connection and try again')
          console.log(err);
        } else {
          comment.author.id = req.user._id
          comment.author.username = req.user.username
          comment.save();
          post.comments.push(comment)
          post.save();
          User.findById({_id:req.user._id}, (err, foundUser) => {
            if (err) {
              console.log(err);
            } else {
              foundUser.comments.push(comment._id)
              foundUser.save()
              req.flash('success', 'Comment added successfully')
              res.redirect('/post/'+post.id)
            }
          })
        }
      })
    }
  })
})
// route to render edit comment page
router.get('/:comment_id/edit', middlewareObj.checkCommentOwnership, (req, res)=> {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      res.redirect('back')
    } else {
      res.render('comment/edit_comment', {post_id:req.params.id, comment:foundComment})
    }
  })
})

// route to edit comment usng PUT
router.put('/:comment_id/edit', middlewareObj.checkCommentOwnership, (req,res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err){
      res.redirect('back')
    } else {
      res.redirect(`/post/${req.params.id}`)
    }
  })
})

// router to render delete confirmation page
router.get('/:comment_id/delete', middlewareObj.checkCommentOwnership, (req, res) => {
  res.render('comment/delete_comment', {post_id:req.params.id, comment_id:req.params.comment_id})
})

router.delete('/:comment_id/delete/yes', middlewareObj.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) {
      res.redirect('back')
    } else {
      req.flash('success', 'Comment deleted')
      res.redirect(`/post/${req.params.id}`)
    }
  })
})

module.exports = router