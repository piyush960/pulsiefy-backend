const router = require('express').Router()
const { user_login_get, user_login_post, user_signup_post, user_logout_get } = require('../controllers/authControllers')

router.get('/login', user_login_get)

router.post('/login', user_login_post)

router.post('/signup', user_signup_post)

router.get('/logout', user_logout_get)

module.exports = router