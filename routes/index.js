const express = require('express')
const router = express.Router()

//Rota principal - index 
router.get('/', (req, res) => {
    res.render('base', {
        title: 'Pagina Inicial',
        view: 'index',
    })
})
module.exports = router