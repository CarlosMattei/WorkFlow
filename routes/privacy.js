const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('base', {
        title: 'Privacy',
        view: 'legalInfos/privacy',
    })
})
module.exports = router