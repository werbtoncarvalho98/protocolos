const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.use(express.json());

const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida.');
    }
});

app.get('/protocolos/:chamado', (req, res) => {
    const chamado = req.params.chamado;

    db.get('SELECT * FROM protocolos WHERE chamado = ?', [chamado], (err, row) => {
        if (err) {
            console.error('Erro ao obter o protocolo:', err.message);
            res.status(500).json({ error: 'Erro ao obter o protocolo' });
        } else if (!row) {
            res.status(404).json({ error: 'Protocolo não encontrado' });
        } else {
            res.json(row);
        }
    });
});

app.post('/protocolos', (req, res) => {
    const { nome, data, localizacao, patrimonio, chamado } = req.body;

    const query = `SELECT * FROM protocolos WHERE chamado = ?`;
    db.get(query, [chamado], (err, row) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err.message);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else if (row) {
            res.status(400).json({ error: 'Já existe um protocolo com o mesmo número de chamado' });
        } else {
            const insertQuery = `INSERT INTO protocolos (nome, data, localizacao, patrimonio, chamado) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertQuery, [nome, data, localizacao, patrimonio, chamado], function (err) {
                if (err) {
                    console.error('Erro ao inserir o protocolo no banco de dados:', err.message);
                    res.status(500).json({ error: 'Erro ao inserir o protocolo no banco de dados' });
                } else {
                    res.json({ message: 'Protocolo criado com sucesso' });
                }
            });
        }
    });
});

app.get('/protocolos', (req, res) => {
    const { searchBy, searchTerm } = req.query;

    let query = 'SELECT * FROM protocolos';

    if (searchBy && searchTerm) {
        let columnName;
        switch (searchBy) {
            case 'nome':
                columnName = 'nome';
                break;
            case 'data':
                columnName = 'data';
                break;
            case 'localizacao':
                columnName = 'localizacao';
                break;
            case 'patrimonio':
                columnName = 'patrimonio';
                break;
            case 'chamado':
                columnName = 'chamado';
                break;
            default:
                return res.status(400).json({ error: 'Opção de busca inválida' });
        }

        query += ` WHERE ${columnName} LIKE '%${searchTerm}%'`;
    }

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err.message);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else {
            res.json(rows);
        }
    });
});

app.put('/protocolos/:chamado', (req, res) => {
    const chamado = req.params.chamado;
    const { nome, data, localizacao, patrimonio } = req.body;

    const updateQuery = `
      UPDATE protocolos
      SET nome = ?, data = ?, localizacao = ?, patrimonio = ?
      WHERE chamado = ?
    `;

    db.run(updateQuery, [nome, data, localizacao, patrimonio, chamado], function (err) {
        if (err) {
            console.error('Erro ao atualizar o protocolo no banco de dados:', err.message);
            res.status(500).json({ error: 'Erro ao atualizar o protocolo no banco de dados' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Protocolo não encontrado' });
        } else {
            res.json({ message: 'Protocolo atualizado com sucesso' });
        }
    });
});

app.delete('/protocolos/:chamado', (req, res) => {
    const chamado = req.params.chamado;

    const deleteQuery = `DELETE FROM protocolos WHERE chamado = ?`;

    db.run(deleteQuery, chamado, function (err) {
        if (err) {
            console.error('Erro ao excluir o protocolo do banco de dados:', err.message);
            res.status(500).json({ error: 'Erro ao excluir o protocolo do banco de dados' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Protocolo não encontrado' });
        } else {
            res.json({ message: 'Protocolo excluído com sucesso' });
        }
    });
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS protocolos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    data TEXT,
    localizacao TEXT,
    patrimonio TEXT,
    chamado TEXT
  )
`;

db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela:', err.message);
    } else {
        console.log('Tabela "protocolos" criada com sucesso');
    }
});

app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});