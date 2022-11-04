const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login')
    } else {
        next();
    }
}

const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard')
    } else {
        next();
    }
}

module.exports = {isLoggedIn, isLoggedOut}