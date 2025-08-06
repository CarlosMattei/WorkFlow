const express = require('express')
const path = require('path')
const app = express()

const PORT = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine',"ejs")
app.use(express.static('public'))
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts)
app.set('layout', 'base')
app.use((req,res,next) => {
    res.locals.currentRoute = req.path;
    res.locals.isProfilePage = req.path.includes('/perfil');
    next();
})

const suspensaoRouter = require('./routes/suspensao')
app.use('/suspensao', suspensaoRouter)
const indexRouter = require('./routes/index')
app.use('/', indexRouter)
const freelancerRouter = require('./routes/Freelancer/freelancer')
app.use('/freelancer', freelancerRouter)
const freelancersRouter = require('./routes/freelancers')
app.use('/freelancers', freelancersRouter)
const searchRouter = require('./routes/searchpage')
app.use('/pesquisa', searchRouter)
const helpRouter = require('./routes/help')
app.use('/ajuda', helpRouter)
const termsRouter = require('./routes/terms')
app.use('/termos', termsRouter)
const privacyRouter = require('./routes/privacy')
app.use('/privacidade', privacyRouter)
const categoryRouter = require('./routes/category')
app.use('/category', categoryRouter)
const contratanteRouter = require('./routes/Contratante/contratante')
app.use('/contratante', contratanteRouter)
const registerRouter = require('./routes/register')
app.use('/register', registerRouter)
const loginRouter = require('./routes/login')
app.use('/login', loginRouter)
const propostaRouter = require('./routes/propostas')
app.use('/propostas', propostaRouter)
const perfilRouter = require('./routes/perfil')
app.use('/perfil', perfilRouter)
const criarPropostaRouter = require('./routes/criarPropostas')
app.use('/criarProposta', criarPropostaRouter)
const criarProjetosRoutes = require('./routes/criarProjeto')
app.use('/criarProjeto', criarProjetosRoutes)

const freePassos = require('./routes/Freelancer/passosFree')
app.use('/freePassos', freePassos)

const contraPasso = require('./routes/Contratante/contraPasso')
app.use('/contraPasso', contraPasso)

const confirmarEmail = require('./routes/confirmacaoEmail')
app.use('/confirmarEmail', confirmarEmail)

const chat = require('./routes/chat')
app.use('/Chat', chat)

const notification = require('./routes/notification')
app.use('/notification', notification)

const config = require('./routes/settings')
app.use('/configuracoes', config)

app.listen(PORT, () => {
    console.log("Servidor em execução na porta " + PORT)
})