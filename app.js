const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const ejs = require('ejs');
const path = require('path');
const { error } = require('console');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'autofix'
});

db.connect((error)=>{
    if(error){
        console.log('erro ao conectar com banco de dados');
    } else{
        console.log('conectado ao mysql');
    }
});

app.use(bodyParser.urlencoded({extended: true}));
app.listen(port, ()=> {
    console.log(`Servidor rodando no endereço: http://localhost:${port}`);
})

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

//rotas
app.get('/', (req, res) => {
    res.render('index1');
});

app.get('/home_mecanico', (req, res) => {
    res.render('home_mecanico');
});


app.get('/manutencoes_andamento', (req, res) => {
    res.render('manutencoes_andamento');
});

app.get('/manutencoes_finalizadas_mecanico', (req, res) => {
    res.render('manutencoes_finalizadas_mecanico');
});

app.get('/home_adm', (req, res) => {
    res.render('home_adm');
});

app.get('/aprovar_entrada_cliente', (req, res) => {
    res.render('aprovar_entrada_cliente');
});

app.get('/aprovar_orcamento_cliente', (req, res) => {
    res.render('aprovar_orcamento_cliente');
});

app.get('/funcionarios_adm', (req, res) => {
    res.render('funcionarios_adm');
});

app.get('/orcamentos_adm', (req, res) => {
    res.render('orcamentos_adm');
});

app.get('/fornecedor_adm', (req, res) => {
    res.render('fornecedor_adm');
});



app.get('/index1', (req, res) => {
    res.render('index1');
});
app.get('/aprovar_entrada_cliente', (req, res) => {
    res.render('aprovar_entrada_cliente');
});

app.get('/aprovar_orcamento_cliente', (req, res) => {
    res.render('aprovar_orcamento_cliente');
});

app.get('/funcionarios_adm', (req, res) => {
    res.render('funcionarios_adm');
});

app.get('/orcamentos_adm', (req, res) => {
    res.render('orcamentos_adm');
});

app.get('/fornecedor_adm', (req, res) => {
    res.render('fornecedor_adm');
});

app.get('/checklist_aprovar_entrada', (req, res) => {
    res.render('checklist_aprovar_entrada');
});

app.get('/meu_veiculo_cliente', (req, res) => {
    res.render('meu_veiculo_cliente');
});

app.get('/acompanhar_cliente', (req, res) => {
    res.render('acompanhar_cliente');
});
//



// Login
app.post('/loginMecanico', (req,res)=>{
    const usuario = req.body.emailMecanico
    const senha = req.body.senhaMecanico
    const idoficina = req.body.id_oficina

    db.query('select senha, idoficina from mecanico where email = ?', [usuario], (error,results)=>{
      
        if(error){
            console.log('erro ao realizar consulta', error);
        }else{
            if(results.length > 0){
                const passwordDB = results[0].senha;
                const idoficinaDB = results[0].idoficina;
                  
                if(passwordDB == senha && idoficinaDB == idoficina ){
                    console.log('login bem sucedido ')
                    res.redirect('/home_mecanico')
                }else{
                    console.log('email ou senha incorretos')
                }

            }else{
                console.log('usuário não cadastrado')
            }
        }
    })
}); 

app.post('/loginAdm', (req,res)=>{
    const usuario = req.body.emailAdm
    const senha = req.body.senhaAdm
    const idoficina = req.body.id_oficina

    db.query('select senha, idoficina from administrador where email = ?', [usuario], (error,results)=>{
      
        if(error){
            console.log('erro ao realizar consulta', error);
        }else{
            if(results.length > 0){
                const passwordDB = results[0].senha;
                const idoficinaDB = results[0].idoficina;
                  
                if(passwordDB == senha && idoficinaDB == idoficina ){
                    console.log('login bem sucedido ')
                    res.redirect('/home_adm')
                }else{
                    console.log('email ou senha incorretos')
                }

            }else{
                console.log('usuário não cadastrado')
            }
        }
    })
});

app.post('/loginCliente', (req,res)=>{
    const usuario = req.body.emailCliente
    const senha = req.body.senhaCliente
    const idoficina = req.body.id_oficina

    db.query('select senha, idoficina from cliente where email = ?', [usuario], (error,results)=>{
      
        if(error){
            console.log('erro ao realizar consulta', error);
        }else{
            if(results.length > 0){
                const passwordDB = results[0].senha;
                const idoficinaDB = results[0].idoficina;
                  
                if(passwordDB == senha && idoficinaDB == idoficina ){
                    console.log('login bem sucedido ')
                    res.redirect('/aprovar_entrada_cliente')
                }else{
                    console.log('email ou senha incorretos')
                }

            }else{
                console.log('usuário não cadastrado')
            }
        }
    })
}); 
//


//rotas de adicionar, exibir cliente
app.get('/clientes_mecanico', (req, res) => {
    db.query('SELECT * FROM cliente ORDER BY data_criacao DESC', (error, results) => {
        if (error) {
            console.log('Erro ao buscar clientes', error);
            res.status(500).send('Erro ao buscar clientes');
        } else {
            res.render('clientes_mecanico', { clientes: results });
        }
    });
});

app.post('/adicionarCliente', (req, res) => {
    const cpf_cliente = req.body.cpf_cliente;
    const nome = req.body.nome_cliente;
    const email = req.body.email_cliente;
    const senha = req.body.senha_cliente;
    const telefone = req.body.telefone_cliente;
    const id_oficina = req.body.id_oficina;
 
    db.query('INSERT INTO cliente (cpf_cliente, telefone, email, nome, senha, idoficina) VALUES  (?, ?, ?, ?, ?, ?)', 
    [cpf_cliente, telefone, email, nome, senha, id_oficina], (error, results) => {
        if (error) {
            console.log('Erro ao cadastrar cliente', error);
        } else {
            console.log('Cliente cadastrado com sucesso');
            // Redireciona para a página de clientes
            res.redirect('/clientes_mecanico');
        }
    });
 });
 

 app.get('/veiculos_do_cliente_mecanico/:cpf_cliente', (req, res) => {
    const cpfCliente = req.params.cpf_cliente;

    db.query('SELECT * FROM cliente WHERE cpf_cliente = ?', [cpfCliente], (clienteError, clienteResults) => {
        if (clienteError) {
            console.log('Erro ao buscar dados do cliente', clienteError);
            return;
        }

        db.query('SELECT * FROM veiculo WHERE cpfcliente = ?', [cpfCliente], (veiculoError, veiculoResults) => {
            if (veiculoError) {
                console.log('Erro ao buscar veículos do cliente', veiculoError);
                return;
            }

            res.render('veiculos_do_cliente_mecanico', { 
                clientes: clienteResults, 
                veiculos: veiculoResults,
                cpf_cliente: cpfCliente
            });
        });
    });
});



app.post('/excluirCliente', (req, res) => {
    const cpfCliente = req.body.cpf_cliente;

    // Primeiro, exclua todos os veículos associados ao cliente
    db.query('DELETE FROM veiculo WHERE cpfcliente = ?', [cpfCliente], (veiculoError) => {
        if (veiculoError) {
            console.log('Erro ao excluir veículos do cliente', veiculoError);
            res.status(500).send('Erro ao excluir veículos do cliente');
            return;
        }

        // Em seguida, exclua o cliente
        db.query('DELETE FROM cliente WHERE cpf_cliente = ?', [cpfCliente], (clienteError) => {
            if (clienteError) {
                console.log('Erro ao excluir cliente', clienteError);
                res.status(500).send('Erro ao excluir cliente');
                return;
            }

            console.log('Cliente excluído com sucesso');
            // Redireciona para a página de clientes
            res.redirect('/clientes_mecanico');
        });
    });
});


// rota de adicionar veiculo ao cliente

app.post('/adicionarVeiculo', (req, res) => {
    const modelo = req.body.modelo_veiculo;
    const placa = req.body.placa_veiculo;
    const cor = req.body.cor_veiculo;
    const marca = req.body.marca_veiculo;
    const ano = req.body.ano_veiculo;
    const cpfCliente = req.body.cpf_cliente;

    db.query('INSERT INTO veiculo (placa, marca, modelo, cor, ano, cpfcliente) VALUES (?, ?, ?, ?, ?, ?)', 
    [placa, marca, modelo, cor, ano, cpfCliente], (error, results) => {
        if (error) {
            console.log('Erro ao cadastrar veiculo', error);
            res.status(500).send('Erro ao cadastrar carro');
        } else {
            console.log('Veículo cadastrado com sucesso');
            // Redireciona para a página de veículos do cliente, incluindo o cpf_cliente
            res.redirect(`/veiculos_do_cliente_mecanico/${cpfCliente}`);
        }
    });
});


app.get('/checklist', (req, res) => {
    res.render('checklist_mecanico');
});
