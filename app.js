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

app.get('/clientes_mecanico', (req, res) => {
    res.render('clientes_mecanico');
});

app.get('/home_adm', (req, res) => {
    res.render('home_adm');
});

app.get('/aprovar_entrada_cliente', (req, res) => {
    res.render('aprovar_entrada_cliente');
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