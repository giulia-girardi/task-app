const express = require('express');
const router = express.Router();
const app = require('../app')
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');
const { default: mongoose } = require('mongoose');
const {isLoggedOut, isLoggedIn} = require('../middleware/route-guard')


//Get signup page
router.get('/signup', isLoggedOut, (req, res) => {
    res.render('authorization/signup')
})

//Post sign up data
router.post('/signup', isLoggedOut, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        //Making sure that all fields are filled:
        if (!firstName || !lastName || !email || !password) {
            res.render('authorization/signup', {errorMessage: 'All fields are mandatory. Please provide your first Name, last Name, email and password. '});
            return;
        } else if (password.length < 10) {
            res.render('authorization/signup', {errorMessage: 'The password needs to have at least 10 characters.'});
            return;
        } else {
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(password, salt)
    
            await User.create({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
            })
            const currentUser = await User.findOne( { email } )
            req.session.user = currentUser
            res.redirect('/dashboard')
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(500).render('authorization/signup', { errorMessage: error.message });
        } else if (error.code === 11000) {
            res.status(500).render('authorization/signup', {errorMessage: 'Email is already used.'})
        } else {
            res.render('authorization/signup', { errorMessage: error.message })
        }
    }
})

// Get Login page
router.get('/login', isLoggedOut, (req, res) => {
    res.render('authorization/login')
})

// Post Login data
router.post('/login', isLoggedOut, async (req, res) => {
    const { email, password } = req.body;
    const currentUser = await User.findOne( { email } )
    console.log('Current User: ', currentUser);
    if (!currentUser) {
        res.render('authorization/login', { errorMessage: 'User does not exist!' })
    } else {
        if (bcrypt.compareSync(password, currentUser.password)) {
            console.log('Session: ', req.session)
            req.session.user = currentUser
            res.redirect('/dashboard')
        } else {
            res.render('authorization/login', { errorMessage: 'Password is not correct!' })
        }
    }
})

//Create Logout
router.get('/logout', isLoggedIn, (req, res, next) => {
    req.session.destroy(error => {
      if (error) {
        next(error)
      }
      res.redirect('/login')
    })
  })

module.exports = router;