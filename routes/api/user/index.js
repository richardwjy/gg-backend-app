const pool = require('../../../db');
const router = require('express').Router();

const MsUsersTable = process.env.MS_USERS;

router.get('/', (req, res) => {
    pool.query(`SELECT * FROM ${MsUsersTable} ORDER BY id ASC`, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(200).json({ status: false, message: error })
        }
        return res.status(200).json(results.rows);
    })
})

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    pool.query(`SELECT * FROM ${MsUsersTable} WHERE id=$1`, [id], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(200).json({ status: false, message: error })
        }
        if (results.rowCount == 0) {
            return res.status(204).json({ status: false, message: "User not exists" });
        }
        return res.status(200).json(results.rows);
    })
})

module.exports = router;