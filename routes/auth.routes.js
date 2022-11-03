const express = require('express');
const router = express.Router();
const app = require('../app')

//Get signup page

router.get('/signup', (req, res) => {
    res.render('authorization/signup')
})

//Get login page

// Get Login page
router.get('/login', (req, res) => {
    res.render('authorization/login')
})

module.exports = router;