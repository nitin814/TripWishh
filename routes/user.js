const express = require('express');
const router = express.Router();

const User = require('../models/user');
const passport = require('passport');

const { storeReturnTo } = require('../middleware');

router.get('/register' , (req,res) => {
    res.render('./user/register');
})

router.post('/register' , async (req,res , next)=> {
    try {
        const {email , username , password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser , password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/trips');
        })
    } catch (e) {
        req.flash('error' , e.message);
        res.redirect('register');
    }
})

router.get('/login' , (req,res) => {
    res.render('./user/login');
})

router.post('/login' , storeReturnTo , passport.authenticate('local' , {failureFlash : true , failureRedirect : '/login'}), (req,res)=> {
    req.flash('success' , `Welcome Back ${req.body.username}`);
    const linktojump = res.locals.returnTo || '\trips';
    if (res.locals.method!='DELETE')
        res.redirect(linktojump);
    else
        res.redirect('\trips');
})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/trips');
    });
}); 

module.exports = router;