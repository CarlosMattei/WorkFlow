const express = require('express')
const router = express.Router()

router.get('/', (req,res) => {
    res.render('partials/suspensao',{
        title: 'Conta Suspensa',
        layout: false
    })
})
module.exports = router