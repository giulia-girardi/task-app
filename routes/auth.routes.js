const express = require('express');
const router = express.Router();
const app = require('../app')
const User = require('../models/User.model')
const bcrypt = require('bcryptjs')

//Get signup page

router.get('/signup', (req, res) => {
    res.render('authorization/signup')
})

//Post sign up data
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
        })
        res.redirect('/dashboard')
    } catch (error) {
        res.render('authorization/signup', { errorMessage: error.message })
    }
})


// Get Login page
router.get('/login', (req, res) => {
    res.render('authorization/login')
})

// Post Login data
router.post('/login', async (req, res) => {
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

module.exports = router;