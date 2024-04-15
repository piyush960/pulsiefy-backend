const jwt = require('jsonwebtoken');
const pool = require('../db')

// const User = require('../models/user');

// const requireAuth = (req, res, next) => {
//     const token = req.cookies.jwt;

//     if(token){
//         jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
//             if(err){
//                 res.redirect('/login');
//             }else{
//                 next();
//             }
//         })
//     }else{
//         res.redirect('/login');
//     }
// }

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    console.log(token)
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if(err){
                res.locals.user = null;
                next();
            }else{
                const userid = decodedToken.id
                const result = await pool.query('SELECT * FROM users WHERE user_id=$1;', [userid]);
                const user = result.rows[0]
                res.locals.user = user;
                next();
            }
        })
    }else{
        res.locals.user = null;
        next();
    }
}


module.exports = { checkUser };