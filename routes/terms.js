const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('base', {
        title: 'Terms',
        view: 'legalInfos/terms',
    })
})
module.exports = router