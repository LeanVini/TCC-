require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const Joi = require('joi');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'agenda_massagem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00'
});

const clienteSchema = Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    telefone: Joi.string().min(8).max(20).required(),
    email: Joi.string().email().max(100).allow(''),
    observacoes: Joi.string().max(1000).allow('')
});

const agendamentoSchema = Joi.object({
    cliente_id: Joi.number().integer().min(1).optional().allow(null),
    cliente_nome: Joi.string().min(2).max(100).optional().allow(''),
    cliente_telefone: Joi.string().min(8).max(20).optional().allow(''),
    cliente_email: Joi.string().email().max(100).optional().allow(''),
    servico_id: Joi.number().integer().min(1).required(),
    data: Joi.date().iso().required(),
    hora: Joi.string().pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/).required(),
    observacoes: Joi.string().max(1000).allow('')
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.get('/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'OK', db: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'Error', db: 'disconnected' });
    }
});

app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes ORDER BY nome');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clientes', async (req, res) => {
    const { error } = clienteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
        const [result] = await pool.execute(
            'INSERT INTO clientes (nome, telefone, email, observacoes) VALUES (?, ?, ?, ?)',
            [req.body.nome, req.body.telefone, req.body.email, req.body.observacoes]
        );
        const [cliente] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
        res.status(201).json(cliente[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/servicos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM servicos ORDER BY nome');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/agendamentos', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email,
                   s.nome as servico_nome, s.duracao, s.preco
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            LEFT JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data DESC, a.hora
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/agendamentos', async (req, res) => {
    const { error } = agendamentoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        let cliente_id = req.body.cliente_id || null;
        if (!cliente_id && req.body.cliente_nome) {
            const [clienteResult] = await conn.execute(
                'INSERT INTO clientes (nome, telefone, email, observacoes) VALUES (?, ?, ?, ?)',
                [req.body.cliente_nome, req.body.cliente_telefone || '', req.body.cliente_email || '', '']
            );
            cliente_id = clienteResult.insertId;
        }
        const [result] = await conn.execute(
            'INSERT INTO agendamentos (cliente_id, servico_id, data, hora, observacoes) VALUES (?, ?, ?, ?, ?)',
            [cliente_id, req.body.servico_id, req.body.data, req.body.hora, req.body.observacoes]
        );
        await conn.commit();
        const [agendamento] = await pool.execute('SELECT * FROM agendamentos WHERE id = ?', [result.insertId]);
        res.status(201).json(agendamento[0]);
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', async () => {
    console.log('Fechando pool de conexões...');
    await pool.end();
    process.exit(0);
});
