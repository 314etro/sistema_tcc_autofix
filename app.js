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
//rotas
app.get('/', (req, res) => {
    res.render('index1');
});

app.get('/home_mecanico', (req, res) => {
    res.render('home_mecanico');
});


app.get('/inspecao_manutencao_pendente', (req, res) => {
    res.render('inspecao_manutencao_pendente');
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

app.get('/inspecao_manutencao', (req, res) => {
    const clientes = [
        { nome: "João Aparecido", modelo: "Honda - Civic type R", placa: "XXX-0000" },
        { nome: "Maria Silva", modelo: "Toyota - Corolla", placa: "YYY-1111" },
        { nome: "Julia Santos", modelo: "Ford - Focus", placa: "ZZZ-2222" },
        { nome: "Estela Clara", modelo: "Chevrolet - Onix", placa: "AAA-3333" }
    ];

    res.render('inspecao_manutencao', { clientes });
});


app.get('/clientes_mecanico', (req,res)=>{
    db.query('SELECT c.nome AS nome_cliente, c.telefone AS telefone, c.email AS email, c.cpf_cliente AS cpf_cliente, v.placa AS placa_veículo FROM cliente c JOIN veiculo v ON c.cpf_cliente = v.cpfcliente;', (error,results) =>{
        if(error){
            console.log('nao foi possivel ver os clientes', error);
  
            
        }else{

            res.render('clientes_mecanico', {clientes: results})
        }
    })
});

