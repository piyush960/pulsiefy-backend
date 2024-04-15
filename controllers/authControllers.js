const jwt = require('jsonwebtoken')
const pool = require('../db')
const bcrypt = require('bcrypt')



const maxAge = 3 * 24 * 60 * 60;
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
}

const user_login_get = (req, res) => {
    res.send('login')
}

const user_logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({success: true});
}

const user_login_post = async (req, res) => {
    const { username, email, password } = req.body;
    try{
        const data = await pool.query('SELECT * FROM users WHERE username=$1 OR email=$2', [username, email])
        if(data.rows.length === 0) throw new Error('user not found');
        const user = data.rows[0]
        console.log(user)
        const auth = await bcrypt.compare(password, user.password);
        if(!auth){
            throw new Error('invalid credentials')
        }
        const token = generateToken(user.user_id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user.user_id, success: true });
    }catch(e){
        res.status(400).json({ success: false, message: e.message });
    }
}

const user_signup_post = async (req, res) => {
    const { username, email, password, firstname, lastname, dob } = req.body;

    try{
        const data = await pool.query('SELECT * FROM users WHERE username=$1 OR email=$2', [username, email])
        if(data.rows.length !== 0) throw new Error('user already exists');
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds)
        const hashedPassword = await bcrypt.hash(password, salt);
        const query_str = 'INSERT INTO users(username, email, password, firstname, lastname, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;'
        const result = await pool.query(query_str, [username, email, hashedPassword, firstname, lastname, dob ? dob : new Date()]);
        const user = result.rows[0]
        const token = generateToken(user.user_id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user_id : user.user_id, success: true });
    }catch(e){
        res.status(400).json({ success: false, message: e.message });
    }
}

module.exports = {
    user_login_get, user_login_post, user_signup_post, user_logout_get
}