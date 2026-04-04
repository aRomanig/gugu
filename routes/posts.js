const express = require('express')
const db = require('../database')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', (req, res) => {
    const stmt = db.prepare(`
        SELECT posts.id, posts.title, posts.content, posts.created_at, users.email
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `)
    const posts = stmt.all()
    res.status(200).json(posts)
})

router.get('/:id', (req, res) => {
    const stmt = db.prepare(`
        SELECT posts.id, posts.title, posts.content, posts.created_at, users.email
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = ?
    `)
    const post = stmt.get(req.params.id)

    if (!post) {
        return res.status(404).json({ erro: 'Post não encontrado' })
    }

    res.status(200).json(post)
})

router.post('/', authMiddleware, (req, res) => {
    const { title, content } = req.body

    if (!title || !content) {
        return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios' })
    }

    if (content.length > 260) {
        return res.status(400).json({ erro: 'O post dever ter no máximo 4 caracteres.' })
    }

    const stmt = db.prepare('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)')
    const result = stmt.run(title, content, req.user.id)

    res.status(201).json({ id: result.lastInsertRowid, title, content })
})

router.put('/:id', authMiddleware, (req, res) => {
    const { title, content } = req.body

    if (!title || !content) {
        return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios' })
    }

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)

    if (!post) {
        return res.status(404).json({ erro: 'Post não encontrado' })
    }

    if (post.user_id !== req.user.id) {
        return res.status(403).json({ erro: 'Você não tem permissão pra editar esse post' })
    }

    db.prepare('UPDATE posts SET title = ?, content = ? WHERE id = ?')
      .run(title, content, req.params.id)

    res.status(200).json({ id: req.params.id, title, content })
})

router.delete('/:id', authMiddleware, (req, res) => {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)

    if (!post) {
        return res.status(404).json({ erro: 'Post não encontrado' })
    }

    if (post.user_id !== req.user.id) {
        return res.status(403).json({ erro: 'Você não tem permissão pra deletar esse post' })
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)

    res.status(200).json({ mensagem: 'Post deletado com sucesso' })
})

module.exports = router