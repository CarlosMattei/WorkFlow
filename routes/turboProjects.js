const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('base', {
        title: 'Turbo',
        view: 'projects/projectsTurbo',
    })
})
module.exports = router