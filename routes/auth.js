const express = require('express')
const db = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/registrar', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios!' })
    }

    const hash = await bcrypt.hash(password, 10)
    try {
        const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)')
        const result = stmt.run(email, hash)
        res.status(201).json({ id: result.lastInsertRowid, email })
    } catch (error) {
        res.status(409).json({ erro: 'Email já cadastrado!' })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios!' })
    }

    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const user = stmt.get(email)

    if (!user) {
        return res.status(401).json({ erro: 'Email ou senha inválidos!' })
    }

    const senhaCorreta = await bcrypt.compare(password, user.password)

    if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Email ou senha inválidos!' })
    }

    const token = jwt.sign(
        { id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' }
    )

    res.status(200).json({ token })
})

module.exports = router