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
        res.redirect('/profile')
    } catch (error) {
        res.render('authorization/signup', { errorMessage: error.message })
    }
})

router.get('/profile', (req, res) => {
    res.render('profile')
})

// Get Login page
router.get('/login', (req, res) => {
    res.render('authorization/login')
})

module.exports = router;