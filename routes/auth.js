const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const async = require('async')
const crypto = require('crypto')
const juice = require('juice')
const htmlToText = require('html-to-text')

const User = mongoose.model('User')
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')


router.get("/", (req, res) => {
    Post.find({}, function (err, posts) {
        if (err) {
            err;
        } else {
            posts;
            res.render("home", {posts});
        }
    });
})

router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/register", (req, res) => {
    if (req.body.password === req.body.checkpassword) {
        const { username, firstname, lastname, email } = req.body
        const newUser = new User({ username, firstname, lastname, email })

        User.register(newUser, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                if (err.code == 11000) {
                    req.flash('error', `user with ${req.body.email} already exist`)
                } else {
                    req.flash('error', err.message)
                }
                res.redirect('back')
            } else {
                passport.authenticate('local')(req, res, function () {
                    req.flash('success', `Welcome to Nairaland Clone ${user.username}` )
                    res.redirect('/')
                })
            }
        })
    } else {
        req.flash("error", "OOOPS!!!!! Password do not match. Try Again")
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

router.get("/forgot", (req, res) => {
     res.render('forgot')
})

router.post("/forgot", (req, res, next) => {
    async.waterfall ([
        function(done) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token)
            })
        },
        (token, done) => {
            User.findOne({email: req.body.email}, (err, user) => {
                if(!user) {
                    req.flash('error', 'No User is registered with email address')
                    return res.redirect('/forgot')
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                })
            })
        },

        function(token, user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: 'nairalandclone@gmail.com',
                    pass: process.env.GMAILPASS
                }
            });

            let mailOptions = {
                to: user.emial,
                from: 'nairalandclone@gmail.com',
                subject: 'Nairaland Clone- Reset Password',
                text: 'You are recieving this email beacause you (or someone else) have requested the reset of the password.' +
                'Please click on the following link, or paste this into your browser to complete the process' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' + 
                'If you did not request this, please ignore this email and your password will remain unchanged'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.')
                done(err, 'done');
            })      
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    })
});

router.get('/reset/:token', (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetpasswordExpires: {$gt: Date.now}}, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.')
            return res.redirect('/forgot')
        }
        res.render('new_pass', {token: req.params.token});
    })
})

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now}}, (err, user) => {
                if(!user) {
                    req.flash('error', 'Password reset token is invalid or has expired')
                    return res.redirect('back')
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save((err) => {
                            req.login(user, (err) => {
                                done(err, user)
                            })
                        })
                    })
                } else {
                    req.flash('error', 'Password do not match. Try again');
                    return res.redirect('back');
                }
            })
        }, function(user, done) {
            let smtpTransport = nodemialer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: 'nairalandclone@gmail.com',
                    pass: process.env.GMAILPASS
                }
            });
            let mailOptions = {
                to: user.emial,
                from: 'nairalandclone@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' + 
                'This is a confirmaton that the password for your account '+ user.email + 'has been changed.'
            }
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash('success', 'Success! Your has password has been changed.');
                done(err);
            })
        }
    ], function(err) {
        res.redirect('/')
    })
})

module.exports = router