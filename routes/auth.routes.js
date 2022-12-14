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
        //Check if passwort has the correct length:
        } else if (password.length < 10) {
            res.render('authorization/signup', {errorMessage: 'The password needs to have at least 10 characters.'});
            return;
        //Encrypt the passwort and create user:
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
        //Email does not have the correct form:
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(500).render('authorization/signup', { errorMessage: error.message });
        //Email is already used:
        } else if (error.code === 11000) {
            res.status(500).render('authorization/signup', {errorMessage: 'Email is already used.'})
        //Other errors:
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
    //Check if user exists in database:
    const currentUser = await User.findOne( { email } )
    if (!currentUser) {
        res.render('authorization/login', { errorMessage: 'User does not exist!' })
    //If user exists, check passwort and set up session for the specific user and redirect to dahsboard:
    } else {
        if (bcrypt.compareSync(password, currentUser.password)) {
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