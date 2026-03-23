=======
require('dotenv').config();\nconst express = require('express');\nconst mysql = require('mysql2/promise');\nconst cors = require('cors');\nconst Joi = require('joi');\nconst path = require('path');\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n// Middleware\napp.use(cors());\napp.use(express.json({ limit: '10mb' }));\napp.use(express.static(path.join(__dirname, '../frontend')));\n\n// DB Pool\nconst pool = mysql.createPool({\n    host: process.env.DB_HOST || 'localhost',\n    port: process.env.DB_PORT || 3306,\n    user: process.env.DB_USER || 'root',\n    password: process.env.DB_PASS || '',\n    database: process.env.DB_NAME || 'agenda_massagem',\n    waitForConnections: true,\n    connectionLimit: 10,\n    queueLimit: 0,\n    timezone: '+00:00'\n});\n\n// Joi Schemas\nconst clienteSchema = Joi.object({\n    nome: Joi.string().min(2).max(100).required(),\n    telefone: Joi.string().min(8).max(20).required(),\n    email: Joi.string().email().max(100).allow(''),\n    observacoes: Joi.string().max(1000).allow('')\n});\n\nconst servicoSchema = Joi.object({\n    nome: Joi.string().min(2).max(100).required(),\n    duracao: Joi.number().integer().min(15).max(240).required(),\n    preco: Joi.number().precision(2).min(0).required()\n});\n\nconst agendamentoSchema = Joi.object({\n    cliente_id: Joi.number().integer().min(1).optional(),\n    cliente_nome: Joi.string().min(2).max(100).optional(),\n    cliente_telefone: Joi.string().min(8).max(20).optional(),\n    cliente_email: Joi.string().email().max(100).optional(),\n    servico_id: Joi.number().integer().min(1).required(),\n    data: Joi.date().min('2024-01-01').iso().required(),\n    hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),\n    observacoes: Joi.string().max(1000).allow('')\n});\n\n// Error handler\napp.use((err, req, res, next) => {\n    console.error(err.stack);\n    res.status(500).json({ error: 'Erro interno do servidor' });\n});\n\n// Health check\napp.get('/health', async (req, res) => {\n    try {\n        const connection = await pool.getConnection();\n        await connection.ping();\n        connection.release();\n        res.json({ status: 'OK', db: 'connected' });\n    } catch (err) {\n        res.status(500).json({ status: 'Error', db: 'disconnected' });\n    }\n});\n\n// CLIENTES CRUD\napp.get('/api/clientes', async (req, res) => {\n    try {\n        const [rows] = await pool.execute('SELECT * FROM clientes ORDER BY nome');\n        res.json(rows);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.get('/api/clientes/:id', async (req, res) => {\n    try {\n        const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);\n        if (rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });\n        res.json(rows[0]);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.post('/api/clientes', async (req, res) => {\n    const { error } = clienteSchema.validate(req.body);\n    if (error) return res.status(400).json({ error: error.details[0].message });\n\n    try {\n        const [result] = await pool.execute(\n            'INSERT INTO clientes (nome, telefone, email, observacoes) VALUES (?, ?, ?, ?)',\n            [req.body.nome, req.body.telefone, req.body.email, req.body.observacoes]\n        );\n        const [cliente] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [result.insertId]);\n        res.status(201).json(cliente[0]);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.put('/api/clientes/:id', async (req, res) => {\n    const { error } = clienteSchema.validate(req.body);\n    if (error) return res.status(400).json({ error: error.details[0].message });\n\n    try {\n        const [result] = await pool.execute(\n            'UPDATE clientes SET nome=?, telefone=?, email=?, observacoes=? WHERE id=?',\n            [req.body.nome, req.body.telefone, req.body.email, req.body.observacoes, req.params.id]\n        );\n        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente não encontrado' });\n        const [cliente] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);\n        res.json(cliente[0]);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.delete('/api/clientes/:id', async (req, res) => {\n    try {\n        const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);\n        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente não encontrado' });\n        res.json({ success: true });\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\n// SERVIÇOS\napp.get('/api/servicos', async (req, res) => {\n    try {\n        const [rows] = await pool.execute('SELECT * FROM servicos ORDER BY nome');\n        res.json(rows);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\n// AGENDAMENTOS (enhanced)\napp.get('/api/agendamentos', async (req, res) => {\n    try {\n        const [rows] = await pool.execute(`\n            SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email,\n                   s.nome as servico_nome, s.duracao, s.preco\n            FROM agendamentos a \n            LEFT JOIN clientes c ON a.cliente_id = c.id\n            LEFT JOIN servicos s ON a.servico_id = s.id \n            ORDER BY a.data DESC, a.hora\n        `);\n        res.json(rows);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.post('/api/agendamentos', async (req, res) => {\n    const { error } = agendamentoSchema.validate(req.body);\n    if (error) return res.status(400).json({ error: error.details[0].message });\n\n    const conn = await pool.getConnection();\n    try {\n        await conn.beginTransaction();\n\n        let cliente_id = req.body.cliente_id;\n        if (!cliente_id && (req.body.cliente_nome || req.body.cliente_telefone)) {\n            // Criar novo cliente inline\n            const [clienteResult] = await conn.execute(\n                'INSERT INTO clientes (nome, telefone, email, observacoes) VALUES (?, ?, ?, ?)',\n                [req.body.cliente_nome, req.body.cliente_telefone || '', req.body.cliente_email || '', '']\n            );\n            cliente_id = clienteResult.insertId;\n        }\n\n        const [result] = await conn.execute(\n            'INSERT INTO agendamentos (cliente_id, servico_id, data, hora, observacoes) VALUES (?, ?, ?, ?, ?)',\n            [cliente_id, req.body.servico_id, req.body.data, req.body.hora, req.body.observacoes]\n        );\n\n        await conn.commit();\n\n        const [agendamentos] = await pool.execute(`\n            SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome \n            FROM agendamentos a \n            LEFT JOIN clientes c ON a.cliente_id = c.id \n            LEFT JOIN servicos s ON a.servico_id = s.id \n            WHERE a.id = ?\n        `, [result.insertId]);\n\n        res.status(201).json(agendamentos[0]);\n    } catch (err) {\n        await conn.rollback();\n        res.status(500).json({ error: err.message });\n    } finally {\n        conn.release();\n    }\n});\n\napp.put('/api/agendamentos/:id', async (req, res) => {\n    const { error } = agendamentoSchema.validate(req.body);\n    if (error) return res.status(400).json({ error: error.details[0].message });\n\n    try {\n        const [result] = await pool.execute(\n            'UPDATE agendamentos SET cliente_id = ?, servico_id = ?, data = ?, hora = ?, observacoes = ? WHERE id = ?',\n            [req.body.cliente_id || null, req.body.servico_id, req.body.data, req.body.hora, req.body.observacoes, req.params.id]\n        );\n        if (result.affectedRows === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });\n\n        const [agendamentos] = await pool.execute(`\n            SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome \n            FROM agendamentos a \n            LEFT JOIN clientes c ON a.cliente_id = c.id \n            LEFT JOIN servicos s ON a.servico_id = s.id \n            WHERE a.id = ?\n        `, [req.params.id]);\n\n        res.json(agendamentos[0]);\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\napp.delete('/api/agendamentos/:id', async (req, res) => {\n    try {\n        const [result] = await pool.execute('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);\n        if (result.affectedRows === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });\n        res.json({ success: true });\n    } catch (err) {\n        res.status(500).json({ error: err.message });\n    }\n});\n\n// Rota raiz\napp.get('/', (req, res) => {\n    res.json({ message: 'API Agenda Massagem v2.0 - Backend completo funcionando!', docs: '/health' });\n});\n\napp.listen(PORT, () => {\n    console.log(`Servidor rodando em http://localhost:${PORT}`);\n    console.log(`Health check: http://localhost:${PORT}/health`);\n});\n\n// Graceful shutdown\nprocess.on('SIGTERM', async () => {\n    console.log('Fechando pool de conexões...');\n    await pool.end();\n    process.exit(0);\n});
=======
const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "agenda_massagem"
});

// Rotas para agendamentos
app.get("/api/agendamentos", (req, res) => {
    db.query(
        "SELECT a.id, a.data, a.hora, a.observacoes, s.nome AS tipo_massagem FROM agendamentos a JOIN servicos s ON a.servico_id = s.id ORDER BY a.data, a.hora",
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

app.post("/api/agendamentos", (req, res) => {
    const { data, hora, servico_id, observacoes } = req.body;
    db.query(
        "INSERT INTO agendamentos (cliente_id, servico_id, data, hora, observacoes) VALUES (1, ?, ?, ?, ?)",
        [servico_id, data, hora, observacoes],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

app.put("/api/agendamentos/:id", (req, res) => {
    const { data, hora, servico_id, observacoes } = req.body;
    db.query(
        "UPDATE agendamentos SET servico_id=?, data=?, hora=?, observacoes=? WHERE id=?",
        [servico_id, data, hora, observacoes, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});

app.delete("/api/agendamentos/:id", (req, res) => {
    db.query(
        "DELETE FROM agendamentos WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});

// Rotas para tipos de massagem (serviços)
app.get("/api/servicos", (req, res) => {
    db.query("SELECT * FROM servicos ORDER BY nome", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Rota raiz
app.get("/", (req, res) => {
    res.send("API de agendamento de massagem funcionando");
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
>>>>>>> 6547155fa0c4739f1157b0709db9cacc1b299fb5
