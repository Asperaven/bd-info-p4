const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('NotasFiscais.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

db.serialize(() => {
    // Criar tabela TB_CLIENTES
    db.run('CREATE TABLE TB_CLIENTES (Cod_Cli INTEGER PRIMARY KEY AUTOINCREMENT, End_Cli TEXT, Nome_Cli TEXT)');   
    // Criar tabela TB_NOTASFISCAIS
    db.run('CREATE TABLE TB_NOTASFISCAIS (Num_NF INTEGER PRIMARY KEY AUTOINCREMENT, Cod_Cli INTEGER, Cod_Vend INTEGER, Serie_NF TEXT, FOREIGN KEY(Cod_Cli) REFERENCES TB_CLIENTES(Cod_Cli), FOREIGN KEY(Cod_Vend) REFERENCES TB_VENDEDORES(Cod_Vend))');    
    // Criar tabela TB_VENDEDORES
    db.run('CREATE TABLE TB_VENDEDORES (Cod_Vend INTEGER PRIMARY KEY AUTOINCREMENT, Nome_Vend TEXT)');
    // Criar tabela TB_ITENSNOTASFISCAIS
    db.run('CREATE TABLE TB_ITENSNOTASFISCAIS (Num_NF INTEGER, Cod_Prod INTEGER, Qtd INTEGER, Valor REAL, PRIMARY KEY(Num_NF, Cod_Prod), FOREIGN KEY(Num_NF) REFERENCES TB_NOTASFISCAIS(Num_NF), FOREIGN KEY(Cod_Prod) REFERENCES TB_PRODUTOS(Cod_Prod))');   
    // Criar tabela TB_PRODUTOS 
    db.run('CREATE TABLE TB_PRODUTOS (Cod_Prod INTEGER PRIMARY KEY AUTOINCREMENT, Nome_Prod TEXT)');
});

// Criar cliente
app.post('/clientes', (req, res) => {
    const {Nome_Cli, End_Cli} = req.body;
    db.run('INSERT INTO TB_CLIENTES (Nome_Cli, End_Cli) VALUES (?, ?)', [Nome_Cli, End_Cli], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Cliente criado com sucesso' });
    });
});

// Obter todos clientes
app.get('/clientes', (req, res) => {
    db.all('SELECT * FROM TB_CLIENTES', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ clientes: rows });
    });
});

// Obter um cliente por código
app.get('/clientes/:Cod_Cli', (req, res) => {
    const {Cod_Cli} = req.params;
    db.get('SELECT * FROM TB_CLIENTES WHERE Cod_Cli = ?', [Cod_Cli], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Cliente não encontrado' });
            return;
        }
        res.json({ clientes: row });
    });
});

// Atualizar um cliente por código
app.put('/clientes/:Cod_Cli', (req, res) => {
    const {Cod_Cli} = req.params;
    const {Nome_Cli, End_Cli} = req.body;
    db.run('UPDATE TB_CLIENTES SET Nome_Cli = ?, End_Cli = ? WHERE Cod_Cli = ?', [Nome_Cli, End_Cli, Cod_Cli], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cliente atualizado com sucesso' });
    });
});

// Excluir um cliente por código
app.delete('/clientes/:Cod_Cli', (req, res) => {
    const {Cod_Cli} = req.params;
    db.run('DELETE FROM TB_CLIENTES WHERE Cod_Cli = ?', [Cod_Cli], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cliente excluído com sucesso' });
    });
});

// Criar notas fiscais
app.post('/notasfiscais', (req, res) => {
    const { Cod_Cli, Cod_Vend, Serie_NF } = req.body;
    if (!Cod_Cli || !Cod_Vend || !Serie_NF) {
        res.status(400).json({ error: 'Cod_Cli, Cod_Vend, e Serie_NF são necessários.' });
        return;
    }
    db.run('INSERT INTO TB_NOTASFISCAIS (Cod_Cli, Cod_Vend, Serie_NF) VALUES (?, ?, ?)', [Cod_Cli, Cod_Vend, Serie_NF], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'Nota fiscal criada com sucesso' });
        }
    );
});
// Obter todos notas fiscais
app.get('/notasfiscais', (req, res) => {
    db.all('SELECT * FROM TB_NOTASFISCAIS', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({notasfiscais: rows });
    });
});

// Obter uma nota fiscal por código
app.get('/notasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    db.get('SELECT * FROM TB_NOTASFISCAIS WHERE Num_NF = ?', [Num_NF], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Nota fiscal não encontrada' });
            return;
        }
        res.json({notasfiscais: row });
    });
});

// Atualizar uma nota fiscal por código
app.put('/notasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    const {Serie_NF} = req.body;
    db.run('UPDATE TB_NOTASFISCAIS SET Serie_NF = ? WHERE Num_NF = ?', [Serie_NF, Num_NF], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Nota fiscal atualizada com sucesso' });
    });
});

// Excluir uma nota fiscal por código
app.delete('/notasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    db.run('DELETE FROM TB_NOTASFISCAIS WHERE Num_NF = ?', [Num_NF], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Nota fiscal excluída com sucesso' });
    });
});

// Criar vendedores
app.post('/vendedores', (req, res) => {
    const {Nome_Vend} = req.body;
    db.run('INSERT INTO TB_VENDEDORES (Nome_Vend) VALUES (?)', [Nome_Vend], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Vendedor criado com sucesso' });
    });
});

// Obter todos vendedores
app.get('/vendedores', (req, res) => {
    db.all('SELECT * FROM TB_VENDEDORES', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({vendedores: rows });
    });
});

// Obter um vendedor por código
app.get('/vendedores/:Cod_Vend', (req, res) => {
    const {Cod_Vend} = req.params;
    db.get('SELECT * FROM TB_VENDEDORES WHERE Cod_Vend = ?', [Cod_Vend], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Vendedor não encontrado' });
            return;
        }
        res.json({vendedores: row });
    });
});

// Atualizar um vendedor por código
app.put('/vendedores/:Cod_Vend', (req, res) => {
    const {Cod_Vend} = req.params;
    const {Nome_Vend} = req.body;
    db.run('UPDATE TB_VENDEDORES SET Nome_Vend = ? WHERE Cod_Vend = ?', [Nome_Vend, Cod_Vend], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Vendedor atualizado com sucesso' });
    });
});

// Excluir um vendedor por código
app.delete('/vendedores/:Cod_Vend', (req, res) => {
    const {Cod_Vend} = req.params;
    db.run('DELETE FROM TB_VENDEDORES WHERE Cod_Vend = ?', [Cod_Vend], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Vendedor excluído com sucesso' });
    });
});

// Criar itens notas fiscais
app.post('/itensnotasfiscais', (req, res) => {
    const { Num_NF, Cod_Prod, Qtd, Valor } = req.body;
    if (!Num_NF || !Cod_Prod || !Qtd || !Valor) {
        res.status(400).json({ error: 'Num_NF, Cod_Prod, Qtd, e Valor são necessários.' });
        return;
    }
    db.run('INSERT INTO TB_ITENSNOTASFISCAIS (Num_NF, Cod_Prod, Qtd, Valor) VALUES (?, ?, ?, ?)', [Num_NF, Cod_Prod, Qtd, Valor], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'Item de nota fiscal criado com sucesso' });
        }
    );
});

// Obter todos itens notas fiscais
app.get('/itensnotasfiscais', (req, res) => {
    db.all('SELECT * FROM TB_ITENSNOTASFISCAIS', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({itensnotasfiscais: rows });
    });
});

// Obter um item de nota fiscal por código
app.get('/itensnotasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    db.get('SELECT * FROM TB_ITENSNOTASFISCAIS WHERE Num_NF = ?', [Num_NF], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Item de nota fiscal não encontrado' });
            return;
        }
        res.json({itensnotasfiscais: row });
    });
});

// Atualizar um item de nota fiscal por código
app.put('/itensnotasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    const {Qtd, Valor} = req.body;
    db.run('UPDATE TB_ITENSNOTASFISCAIS SET Qtd = ?, Valor = ? WHERE Num_NF = ?', [Qtd, Valor, Num_NF], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Item de nota fiscal atualizado com sucesso' });
    });
});

// Excluir um item de nota fiscal por código
app.delete('/itensnotasfiscais/:Num_NF', (req, res) => {
    const {Num_NF} = req.params;
    db.run('DELETE FROM TB_ITENSNOTASFISCAIS WHERE Num_NF = ?', [Num_NF], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Item de nota fiscal excluído com sucesso' });
    });
});

// Criar produtos
app.post('/produtos', (req, res) => {
    const {Nome_Prod} = req.body;
    db.run('INSERT INTO TB_PRODUTOS (Nome_Prod) VALUES (?)', [Nome_Prod], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Produto criado com sucesso' });
    });
});

// Obter todos os produtos
app.get('/produtos', (req, res) => {
    db.all('SELECT * FROM TB_PRODUTOS', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({produtos: rows });
    });
});

// Obter um produto por código
app.get('/produtos/:Cod_Prod', (req, res) => {
    const {Cod_Prod} = req.params;
    db.get('SELECT * FROM TB_PRODUTOS WHERE Cod_Prod = ?', [Cod_Prod], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Produto não encontrado' });
            return;
        }
        res.json({produtos: row });
    });
});

// Atualizar um produto por código
app.put('/produtos/:Cod_Prod', (req, res) => {
    const {Cod_Prod} = req.params;
    const {Nome_Prod} = req.body;
    db.run('UPDATE TB_PRODUTOS SET Nome_Prod = ? WHERE Cod_Prod = ?', [Nome_Prod, Cod_Prod], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Produto atualizado com sucesso' });
    });
});

// Excluir um produto por código
app.delete('/produtos/:Cod_Prod', (req, res) => {
    const {Cod_Prod} = req.params;
    db.run('DELETE FROM TB_PRODUTOS WHERE Cod_Prod = ?', [Cod_Prod], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Produto excluído com sucesso' });
    });
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor está ouvindo na porta ${port}`);
});

