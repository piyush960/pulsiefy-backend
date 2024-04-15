const axios = require('axios');
const pool = require('../db');

const getHospitalData = async (lat, lon, query) => {

    const options = {
        method: 'GET',
        url: process.env.MAP_API_ENDPOINT+'nearby.php',
        params: {
          query,
          lat: lat,
          lng: lon,
          limit: '6',
          country: 'in',
          lang: 'en',
          offset: '0',
          zoom: '15'
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': process.env.RAPID_API_HOST,
        }
    }
    try{     
        const hospital = await axios.request(options);
        return hospital.data;
    }
    catch (error) {
        throw new Error(error.message)
    }
}


const get_hospital_list_post = async (req, res) => {
    const { symptoms, query, lat, lon } = req.body;
    console.log(res.locals.user)
    try{
        if(symptoms){
            // make call to ML api
        }
        const data = await getHospitalData(lat, lon, query)
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({ success: false, message: e.message })
    }
}

const get_hospital_details = async (req, res) => {
    const id = req.params.id
    
    const options = {
        method: 'GET',
        url: process.env.MAP_API_ENDPOINT+'place.php',
        params: {
          business_id: id,
        },
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': process.env.RAPID_API_HOST,
        }
    };
      
    try {
        const response = await axios.request(options);
        const { business_id, phone_number, name, rating, review_count, website, state, place_link, full_address } = response.data.data[0];
        const data = await pool.query('SELECT * FROM recents WHERE hos_id=$1 AND user_id=$2', [business_id, res.locals.user.user_id]);
        if(res.locals.user && data.rows.length === 0)
            await pool.query('INSERT INTO recents(hos_id, loc, phone, rating, email, hos_name, user_id, time_searched) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [business_id, full_address, phone_number, String(rating)+','+String(review_count), website, name, res.locals.user.user_id, new Date()])
        res.status(200).json(response.data)
    } catch (e) {
        console.error(e);        
        res.status(500).json({ success: false, message: e.message })
    }
}

const get_recents_searches = async (req, res) => {
    try{
        if(!res.locals.user) throw new Error('user not logged in')
        const response = await pool.query(`SELECT users.user_id, recents.hos_id, recents.hos_name, recents.phone, recents.email, recents.rating, recents.loc FROM 
        recents JOIN users ON users.user_id = recents.user_id WHERE users.user_id = $1 ORDER BY time_searched ASC;`, [res.locals.user.user_id])
        res.status(200).json(response.rows);
    }
    catch(e){
        console.error(e);        
        res.status(500).json({ success: false, message: e.message })
    }
}

const remove_recent_delete = async (req, res) => {
    try{
        if(!res.locals.user) throw new Error('user not logged in')
        const { hos_id, user_id } = req.body;
        const response = await pool.query('DELETE FROM recents WHERE hos_id=$1 AND user_id=$2 RETURNING *', [hos_id, user_id]);
        res.status(202).json(response.rows[0])
    }catch(e){
        console.error(e);        
        res.status(500).json({ success: false, message: e.message })
    }
}

const book_appointment_post = async (req, res) => {
    try{
        if(!res.locals.user) throw new Error('user not logged in')
        const { hos_name , doc_name , schedule_on , firstname , email , phone , comments , time_of_day } = req.body;
        const response = await pool.query('INSERT INTO appointments(hos_name , doc_name , schedule_on , firstname , email , phone , comments , time_of_day, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [ hos_name , doc_name , new Date(schedule_on) , firstname , email , phone , comments , time_of_day, res.locals.user.user_id]);
        res.status(200).json(response.rows[0])
    }
    catch(e){
        console.log(e)
        res.status(500).json({ success: false, message: e.message })
    }
}

const get_all_appointments = async (req, res) => {
    try{
        if(!res.locals.user) throw new Error('user not logged in')
        const data = await pool.query(`SELECT * FROM appointments JOIN users on users.user_id = appointments.user_id WHERE users.user_id = $1;`, [res.locals.user.user_id])
        res.status(200).json(data.rows)
    }
    catch(e){
        console.log(e)
        res.status(500).json({ success: false, message: e.message })
    }
}

const remove_appointment_delete = async (req, res) => {
    try{
        if(!res.locals.user) throw new Error('user not logged in')
        const { appointment_id, user_id } = req.body;
        const response = await pool.query('DELETE FROM appointments WHERE appointment_id=$1 AND user_id=$2 RETURNING *', [appointment_id, user_id]);
        res.status(202).json({data: response.rows[0], success: true})
    }catch(e){
        console.error(e);        
        res.status(500).json({ success: false, message: e.message })
    }
}

const register_for_donation_post = async (req, res) => {
    try{
        const { donor_first, donor_last, dob, gender, phone, email, weight, bmi, hb, bp, hasdonated, diseases, medicines, donor_comments } = req.body;
        const response = await pool.query(`INSERT INTO donors(donor_first, donor_last, dob, gender, phone, email, weight, bmi, hb, bp, hasdonated, diseases, medicines, donor_comments, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`, [donor_first, donor_last, new Date(dob), gender, phone, email, weight, bmi, hb, bp, hasdonated, diseases, medicines, donor_comments, res.locals.user ? res.locals.user.user_id : null])

        res.status(200).json({data: response.rows[0], success: true})
    }
    catch(e){
        console.log(e);
        res.status(500).json({ success: false, message: e.message })
    }

}

module.exports = {
    get_hospital_details, get_hospital_list_post, get_recents_searches, book_appointment_post, get_all_appointments,
    remove_recent_delete, remove_appointment_delete, register_for_donation_post
}