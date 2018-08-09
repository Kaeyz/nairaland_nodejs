const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')

router.get("/", (req, res) => {
    Post.find({}, function (err, posts) {
        if (err) {
            err;
        } else {
            posts;
            res.render("home", {
                posts
            });
        }
    });
})

router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/register", (req, res) => {
    if (req.body.password === req.body.checkpassword) {
        const {
            username,
            firstname,
            lastname,
            email
        } = req.body
        const newuser = new User({
            username,
            firstname,
            lastname,
            email
        })
        User.register(newuser, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                if (err.code == 11000) {
                    req.flash('error', `user with ${req.body.email} exist already`)
                } else {
                    req.flash('error', err.message)
                }
                res.redirect('back')
            } else {
                passport.authenticate('local')(req, res, function () {
                    req.flash('success', `Welcome to Nairaland Clone ${user.username}`)
                    res.redirect('/')
                })
            }
        })
    } else {
        res.redirect('back');
    }
})
router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    successFlash : 'Logged in Successfully',
    failureRedirect: '/login',
    failureFlash: 'Unable to log in. TRY AGAIN'
}), (req, res) => {})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Logged Out. Log in to gain access again')
    res.redirect('/')
})

module.exports = router