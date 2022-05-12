const pool = require('../../../db');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MsUsersTable = process.env.MS_USERS;

const getUserByEmail = async (email) => {
    const queryResults = await pool.query(`SELECT * FROM ${MsUsersTable} WHERE email=$1`, [email]);
    return queryResults.rows[0];
}

router.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userData = await getUserByEmail(email);
        if (!bcrypt.compareSync(password, userData.password)) {
            return res.status(401).json({ status: false, message: "Wrong Password" })
        }
        delete userData.password;
        const userToken = jwt.sign(userData, process.env.PRIVATE_KEY, { expiresIn: '20m' });
        return res.json({ status: true, message: "Logged In!", data: userData, token: userToken });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
});

// Forget password using OTP via Email

module.exports = router;