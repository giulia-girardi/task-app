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
        const { firstname, lastname, email, password } = req.body;
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        await User.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
        })
        res.redirect('/profile')
    } catch (error) {
        res.render('/signup', { errorMessage: error.message })
    }
})


// Get Login page
router.get('/login', (req, res) => {
    res.render('authorization/login')
})

module.exports = router;