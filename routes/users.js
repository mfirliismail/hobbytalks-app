const express = require('express')
const router = express.Router()
const users = require('../controllers/users')

router.get('/', (req, res) => {
    console.log('running')
})

module.exports = router