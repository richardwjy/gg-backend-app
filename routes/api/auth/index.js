const pool = require('../../../db');
const router = require('express').Router();
// const otpGenerator = require('otp-generator');
const emailService = require('../../../middleware/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MsUsersTable = process.env.MS_USERS;

const checkUserExist = async (email) => {
    // Check if email is exist and OtpVerified.
    const queryResults = await pool.query(`SELECT * FROM ${MsUsersTable} WHERE email = $1 AND OTP_VERIFIED = TRUE`, [email]);
    if (queryResults.rowCount > 0) {
        return true;
    }
    return false;
}

const getUserIdByEmail = async (email) => {
    const queryResults = await pool.query(`SELECT * FROM ${MsUsersTable} WHERE email=$1`, [email]);
    if (queryResults.rowCount > 0) {
        return queryResults.rows[0].id;
    }
    return -1;
}

const getUserDetail = async (userId) => {
    const queryResults = await pool.query(`SELECT * FROM ${MsUsersTable} WHERE id=$1`, [userId]);
    if (queryResults.rowCount > 0) {
        return queryResults.rows[0].id;
    }
    throw new Error("Id not exists");
}

const getUserByEmail = async (email) => {
    const queryResults = await pool.query(`SELECT * FROM ${MsUsersTable} WHERE email=$1`, [email]);
    return queryResults.rows[0];
}

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    // 1. Check if email is exist on DB, if exist then check otp_verified.
    //  1.1. If otp_verified is false, then update username password. Then resend new OTP Code.
    //  1.2. If otp_verified is true, then return message "Email is registered, please proceed to login."
    if (await checkUserExist(email, res)) { // If True, return to login. If False, send new verify link.
        return res.json({ status: false, message: "User already exist, proceed to login!" });
    }
    // If Email don't exist
    // 2. Insert username password into DB
    // 3. Generate an OTP Code to verify user (create a 60s window to verify)
    let userId = await getUserIdByEmail(email, res);
    if (userId === -1) {
        //Insert new user, then update user id
        try {
            const salt = bcrypt.genSaltSync(Number(process.env.saltRounds));
            const hashedPassword = bcrypt.hashSync(password, salt);
            const insertResult = await pool.query(`INSERT INTO ${MsUsersTable} (username, password, email, otp_code, otp_exp_time, otp_verified) VALUES ($1,$2,$3,$4,$5,$6)`, [username, hashedPassword, email, '', 0, FALSE]);
            // const newUserData = {
            //     id: insertResult.insertId,
            //     username,
            //     email
            // }
            userId = insertResult.insertId;
        } catch (err) {
            console.log(err);
            return res.status(500).json({ status: false, message: "Error while registering user to database" })
        }
    }
    // Condition when User Exists and OTP_VERIFIED = false
    // Send new verify link with User Id in it. (Either get from MS_USERS or Insert new data to DB first)
    // Generate JWT Token and set expiredIn to 1 hours.
    // Send email with redirect link to frontend with generated JWT Token as Link.
    const jwtToken = jwt.sign({ id: userId }, process.env.PRIVATE_KEY_VERIFY_EMAIL, { expiresIn: '1h' });
    emailService.send(email, jwtToken, "Verify");
    return res.json({ status: true, message: "Confirmation email has been sent!" });
    // To generate OTP Code
    // const otpCode = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false }).toUpperCase();
});

router.get('/assign-token', (req, res) => {
    const jwtToken = jwt.sign({ id: 909 }, process.env.PRIVATE_KEY_VERIFY_EMAIL, { expiresIn: '1h' });
    return res.json({ token: jwtToken });
})

router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(404).json({ status: false, message: "No token attached!" })
    } else {
        try {
            const userData = jwt.verify(token, process.env.PRIVATE_KEY_VERIFY_EMAIL);
            // Pending, Get user information and pass to Frontend
            const userDetail = await getUserDetail(userData.id);
            return res.json({ status: true, data: userDetail });
        } catch (err) {
            return res.status(401).json({ status: false, message: err.message || "Token is expired" })
        }
    }
})

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(422).json({ status: false, message: "No email attached" })
    }
    try {
        const userData = await getUserIdByEmail(email);
        if (userData !== -1) {
            const userToken = jwt.sign({ id: userData }, process.env.PRIVATE_KEY_FORGET_PASS, { expiresIn: '20m' });
            emailService.send(email, userToken, "ForgetPassword");
        }
        return res.json({ status: true, message: "Email is being sent!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: err.message })
    }
});

router.post('/validate-forget', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(404).json({ status: false, message: "No token attached!" })
    } else {
        try {
            const userData = jwt.verify(token, process.env.PRIVATE_KEY_FORGET_PASS);
            // Pending, Get user information and pass to Frontend
            return res.json({ status: true, data: userData });
        } catch (err) {
            return res.status(401).json({ status: false, message: "Token Expired" })
        }
    }
});

router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userData = await getUserByEmail(email);
        if (!bcrypt.compareSync(password, userData.password)) {
            return res.status(401).json({ status: false, message: "Wrong Password" })
        }
        delete userData.password;
        const userToken = jwt.sign(userData, process.env.PRIVATE_KEY, { expiresIn: '20m' });
        // return res.status(200).cookie('token', token, {
        //     httpOnly: true,
        //     maxAge: 3600000
        // }).json({ status: true, data: { username, ...userData.data } })
        return res.json({ status: true, message: "Logged In!", data: userData, token: userToken });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
});

router.post('/logout', (req, res) => {
    return res.json({ status: true, message: "Logged out!" });
});

module.exports = router;