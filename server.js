const express = require('express')
const cors = require('cors')
const db = require('./database')
const authRoutes = require('./routes/auth')

const app = express()
app.use(express.json())
app.use(cors())
const postRoutes = require('./routes/posts')
app.use('/posts', postRoutes)
app.use('/auth', authRoutes)
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.json({mensagem: 'Servidor funcionando!'})
})

app.get('/health', (req, res) => {
    res.status(200).json({status: 'Servidor funcionando'})
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})