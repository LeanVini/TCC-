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