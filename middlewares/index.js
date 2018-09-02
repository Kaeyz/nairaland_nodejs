const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const middlewareObj = {};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect('back')
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect('back')
                }
            }
        })
    } else {
        res.redirect('back')
    }
}


middlewareObj.checkPostOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Post.findById(req.params.id, (err, foundPost) => {
            if (err) {
                console.log(err);
                redirect('back')
            } else {
                if (foundPost.author.id.equals(req.user._id)) {
                    next()
                } else {
                    console.log("you are not permitted to edit post");
                    res.redirect('back')
                }
            }
        })
    } else {
        console.log('you are not logged in');
        res.redirect('back')
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}



module.exports = middlewareObj