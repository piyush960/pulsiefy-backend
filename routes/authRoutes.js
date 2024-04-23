const router = require('express').Router()
const { user_details_post, user_login_post, user_signup_post, user_logout_get } = require('../controllers/authControllers')

router.post('/user-details', user_details_post)

router.post('/login', user_login_post)

router.post('/signup', user_signup_post)

router.get('/logout', user_logout_get)

module.exports = router