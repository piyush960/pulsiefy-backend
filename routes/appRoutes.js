const router = require('express').Router()
const { get_hospital_details, get_hospital_list_post, get_recents_searches, book_appointment_post, get_all_appointments, remove_recent_delete, remove_appointment_delete, register_for_donation_post } = require('../controllers/appControllers')
const pool = require('../db')
const { checkUser } = require('../middleware/authMiddleware')

router.post('/nearby-hospitals', get_hospital_list_post)

router.get('/hospital-details/:id', get_hospital_details)

router.get('/get-recents', get_recents_searches)

router.post('/book-appointment', checkUser, book_appointment_post);

router.delete('/remove-recent', remove_recent_delete)

router.delete('/remove-appointment', remove_appointment_delete)

router.get('/get-appointments', get_all_appointments);

router.post('/donor-register', checkUser, register_for_donation_post);

module.exports = router