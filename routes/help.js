const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('base', {
        title: 'Help',
        view: 'legalInfos/help',
    })
})
module.exports = router