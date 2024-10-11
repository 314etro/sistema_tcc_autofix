    const express = require('express');
    const bodyParser = require('body-parser');
    const mysql = require('mysql2');
    const ejs = require('ejs');
    const path = require('path');
    const { error } = require('console');
    const app = express();
    const port = 3000;

    const session = require('express-session'); // Adicione o módulo express-session

    app.use(session({
        secret: 'your-secret-key', // Substitua por uma chave secreta forte
        resave: false,
        saveUninitialized: true
    }));

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

    app.get('/checklist_aprovar_entrada', (req, res) => {
        res.render('checklist_aprovar_entrada');
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


    app.get('/aprovar_orcamento_cliente', (req, res) => {
        res.render('aprovar_orcamento_cliente');
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


    app.get('/aprovar_orcamento_cliente', (req, res) => {
        res.render('aprovar_orcamento_cliente');
    });


    app.get('/orcamentos_adm', (req, res) => {
        res.render('orcamentos_adm');
    });


    app.get('/meu_veiculo_cliente', (req, res) => {
        res.render('meu_veiculo_cliente');
    });

    app.get('/acompanhar_cliente', (req, res) => {
        res.render('acompanhar_cliente');
    });

    app.get('/editar_perfil_cliente', (req, res) => {
        res.render('editar_perfil_cliente');
    });
    //



    // Login
    app.post('/loginMecanico', (req, res) => {
        const usuario = req.body.emailMecanico;
        const senha = req.body.senhaMecanico;
        const idoficina = req.body.id_oficina;
    
        db.query('select senha, idoficina, cpf_mecanico from mecanico where email = ?', [usuario], (error, results) => {
        if (error) {
            console.log('Erro ao realizar consulta', error);
        } else {
            if (results.length > 0) {
            const passwordDB = results[0].senha;
            const idoficinaDB = results[0].idoficina;
            const cpfMecanico = results[0].cpf_mecanico; // Obtenha o CPF do mecânico

            if (passwordDB == senha && idoficinaDB == idoficina) {
            console.log('login bem sucedido ');
            // Crie a sessão e armazene o CPF do mecânico
            req.session.cpfMecanico = cpfMecanico; 
            res.redirect('/home_mecanico');
            } else {
            console.log('email ou senha incorretos');
            }
        } else {
            console.log('usuário não cadastrado');
        }
        }
    });
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

    app.post('/loginCliente', (req, res) => {
        const usuario = req.body.emailCliente;
        const senha = req.body.senhaCliente;
        const idoficina = req.body.id_oficina;
    
        db.query('select senha, idoficina, cpf_cliente from cliente where email = ?', [usuario], (error, results) => {
            if (error) {
                console.log('Erro ao realizar consulta', error);
                res.status(500).send('Erro ao realizar consulta');
            } else {
                if (results.length > 0) {
                    const passwordDB = results[0].senha;
                    const idoficinaDB = results[0].idoficina;
                    const cpfCliente = results[0].cpf_cliente; // Obtenha o CPF do cliente
    
                    if (passwordDB == senha && idoficinaDB == idoficina) {
                        console.log('login bem sucedido ');
                        // Crie a sessão e armazene o CPF do cliente
                        req.session.cpfCliente = cpfCliente; 
                        res.redirect('/aprovar_entrada_cliente'); // Redirecione para a página de aprovação de entrada
                    } else {
                        console.log('email ou senha incorretos');
                        res.send('Email ou senha incorretos');
                    }
                } else {
                    console.log('usuário não cadastrado');
                    res.send('Usuário não cadastrado');
                }
            }
        });
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

    app.post('/excluirCliente', (req, res) => {
        const cpfCliente = req.body.cpf_cliente;

        // Primeiro, exclua todas as inspeções de entrada associadas ao veículo do cliente
        db.query('DELETE FROM inspecao_entrada WHERE placa IN (SELECT placa FROM veiculo WHERE cpfcliente = ?)', [cpfCliente], (inspecaoError) => {
            if (inspecaoError) {
                console.log('Erro ao excluir inspeções de entrada', inspecaoError);
                res.status(500).send('Erro ao excluir inspeções de entrada');
                return;
            }

            // Em seguida, exclua todos os veículos associados ao cliente
            db.query('DELETE FROM veiculo WHERE cpfcliente = ?', [cpfCliente], (veiculoError) => {
                if (veiculoError) {
                    console.log('Erro ao excluir veículos do cliente', veiculoError);
                    res.status(500).send('Erro ao excluir veículos do cliente');
                    return;
                }

                // Por fim, exclua o cliente
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
    });

    //

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
    //

    // rota checklsit
    app.get('/checklist/:placa', (req, res) => {
        // Verifique se a sessão do mecânico está ativa
        if (!req.session.cpfMecanico) {
            return res.redirect('/loginMecanico'); // Redireciona para o login se a sessão não existir
        }
        const placa = req.params.placa;
        res.render('checklist_mecanico', { placa: placa });
    });

    app.post('/inspecao_entrada/:placa', (req, res) => {
        const placa = req.params.placa;
    
        const pintura_padrao = req.body.pintura_padrao;
        const limpador_de_para_brisa_dianteiro = req.body.limpador_de_para_brisa_dianteiro;
        const marcacao_dos_pneus_traseiro = req.body.marcacao_dos_pneus_traseiro;
        const lentes_do_farol = req.body.lentes_do_farol;
        const luz_de_freio = req.body.luz_de_freio;
        const lentes_de_lanterna = req.body.lentes_de_lanterna;
        const luz_de_direcao = req.body.luz_de_direcao;
        const nivel_de_agua_no_limpador_de_parabrisa = req.body.nivel_de_agua_no_limpador_de_parabrisa;
        const estado_dos_pneus = req.body.estado_dos_pneus;
        const porta_traseira_esquerda = req.body.porta_traseira_esquerda;
        const porta_traseira_direita = req.body.porta_traseira_direita;
        const nivel_de_oleo = req.body.nivel_de_oleo;
        const tag = req.body.tag;
        const cinto_de_seguranca = req.body.cinto_de_seguranca;
        const extintor_de_incendio = req.body.extintor_de_incendio;
        const kit_multimidia_radio_am_fm = req.body.kit_multimidia_radio_am_fm;
        const macaco = req.body.macaco;
        const estepe = req.body.estepe;
        const triangulo_de_seguranca = req.body.triangulo_de_seguranca;
        const estofamento = req.body.estofamento;
        const chave_de_roda = req.body.chave_de_roda;
        const certificado_ant = req.body.certificado_ant;
        const para_lama_dianteiro_direito = req.body.para_lama_dianteiro_direito;
        const para_lama_traseiro_esquerdo = req.body.para_lama_traseiro_esquerdo;
        const para_lama_traseiro_direito = req.body.para_lama_traseiro_direito;
        const teto = req.body.teto;
        const para_choque_dianteiro = req.body.para_choque_dianteiro;
        const capo_do_motor = req.body.capo_do_motor;
        const para_brisa_dianteiro = req.body.para_brisa_dianteiro;
        const vidro_lateral_esquerdo = req.body.vidro_lateral_esquerdo;
        const vidro_lateral_direito = req.body.vidro_lateral_direito;
        const porta_dianteira_esquerda = req.body.porta_dianteira_esquerda;
        const porta_dianteira_direita = req.body.porta_dianteira_direita;
        const para_lama_dianteiro_esquerdo = req.body.para_lama_dianteiro_esquerdo;
        const para_choque_traseiro = req.body.para_choque_traseiro;
        const para_brisa_traseiro = req.body.para_brisa_traseiro;
        const nivel_combustivel = req.body.nivel_combustivel;
        const tacografo = req.body.tacografo;
        const limpador_para_brisa_traseiro = req.body.limpador_para_brisa_traseiro;
        const luz_de_re = req.body.luz_de_re;
        const bateria = req.body.bateria;
        const status = req.body.status
        const cpfmecanico = req.session.cpfMecanico; // Obtenha o CPF da sessão

    

        db.query(
            'INSERT INTO inspecao_entrada (placa, pintura_padrao, limpador_de_para_brisa_dianteiro, marcacao_dos_pneus_traseiro, lentes_do_farol, luz_de_freio, lentes_de_lanterna, luz_de_direcao, nivel_de_agua_no_limpador_de_parabrisa, estado_dos_pneus, porta_traseira_esquerda, porta_traseira_direita, nivel_de_oleo, tag, cinto_de_seguranca, extintor_de_incendio, kit_multimidia_radio_am_fm, macaco, estepe, triangulo_de_seguranca, estofamento, chave_de_roda, certificado_ant, para_lama_dianteiro_direito, para_lama_traseiro_esquerdo, para_lama_traseiro_direito, teto, para_choque_dianteiro, capo_do_motor, para_brisa_dianteiro, vidro_lateral_esquerdo, vidro_lateral_direito, porta_dianteira_esquerda, porta_dianteira_direita, para_lama_dianteiro_esquerdo, para_choque_traseiro, para_brisa_traseiro, nivel_combustivel, tacografo, limpador_para_brisa_traseiro, luz_de_re, bateria, status, cpfmecanico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)',
            
            [
                placa, // Adicione a placa aqui
                pintura_padrao,
                limpador_de_para_brisa_dianteiro,
                marcacao_dos_pneus_traseiro,
                lentes_do_farol,
                luz_de_freio,
                lentes_de_lanterna,
                luz_de_direcao,
                nivel_de_agua_no_limpador_de_parabrisa,
                estado_dos_pneus,
                porta_traseira_esquerda,
                porta_traseira_direita,
                nivel_de_oleo,
                tag,
                cinto_de_seguranca,
                extintor_de_incendio,
                kit_multimidia_radio_am_fm,
                macaco,
                estepe,
                triangulo_de_seguranca,
                estofamento,
                chave_de_roda,
                certificado_ant,
                para_lama_dianteiro_direito,
                para_lama_traseiro_esquerdo,
                para_lama_traseiro_direito,
                teto,
                para_choque_dianteiro,
                capo_do_motor,
                para_brisa_dianteiro,
                vidro_lateral_esquerdo,
                vidro_lateral_direito,
                porta_dianteira_esquerda,
                porta_dianteira_direita,
                para_lama_dianteiro_esquerdo,
                para_choque_traseiro,
                para_brisa_traseiro,
                nivel_combustivel,
                tacografo,
                limpador_para_brisa_traseiro,
                luz_de_re,
                bateria,
                status,
                cpfmecanico

            ],
            (error, results) => {
                if (error) {
                    console.log('Erro ao cadastrar inspeção', error);
                    res.status(500).send('Erro ao cadastrar inspeção');
                } else {
                    console.log('Inspeção cadastrada com sucesso');
                    res.redirect('/home_mecanico');
                }
            }
        );
        
    });
    //

    //rota funcionario 
    app.get('/funcionarios_adm', (req, res) => {
        db.query('SELECT * FROM mecanico ORDER BY data_criacao DESC', (error, results) => {
            if (error) {
                console.log('Erro ao buscar funcionario', error);
                res.status(500).send('Erro ao buscar funcionario');
            } else {
                res.render('funcionarios_adm', { funcionarios: results });
            }
        });
    });

    app.post('/adicionarFuncionario', (req, res) => {
        const cpf_mecanico = req.body.cpf_mecanico;
        const nome = req.body.nome_mecanico;
        const email = req.body.email_mecanico;
        const telefone = req.body.telefone_mecanico;
        const senha = req.body.senha_mecanico;
        const id_oficina = req.body.id_oficina;
        const cpf_adm = req.body.cpf_adm;
    
        db.query('INSERT INTO mecanico (cpf_mecanico, nome, email, telefone, senha, idoficina, cpfadm) VALUES  (?, ?, ?, ?, ?, ?, ?)', 
        [cpf_mecanico, nome, email, telefone, senha, id_oficina, cpf_adm], (error, results) => {
            if (error) {
                console.log('Erro ao cadastrar mecanico', error);
            } else {
                console.log(results);
                console.log('mecanico cadastrado com sucesso');
                // Redireciona para a página de clientes
                res.redirect('/funcionarios_adm');
            }
        });
    });


    app.post('/editarFuncionario', (req, res) =>{
        const cpf_mecanico = parseInt(req.body.inputCpf_mecanico);
        const nome = parseInt(req.body.inputNome);
        const email = req.body.inputEmail;
        const senha = parseInt(req.body.inputSenha);
        const telefone = req.body.inputTelefone;
        const id_oficina = req.body.textId_oficina;
        db.query('update livro set cpf_mecanico = ?, nome = ?, email = ?, senha = ?, telefone = ?, id_oficina = ? where cpf_mecanico = ?', [cpf_mecanico, nome, email, senha, telefone, id_oficina, cpf_mecanico], (error, results) =>{
        if(error){
            console.log('Erro ao editar Funcionário');
        } else {
            res.redirect('/funcionarios_adm');
        }
        });
    });
    //


    app.get('/aprovar_entrada_cliente', (req, res) => {
        // Verifique se o cliente está autenticado
        if (!req.session.cpfCliente) {
            return res.redirect('/loginCliente'); // Redirecione para o login se não estiver autenticado
        }
      
        // Faça uma consulta ao banco de dados para obter os veículos
        db.query(
            `SELECT v.placa, v.marca, v.modelo, v.cor, v.ano, c.cpf_cliente, c.nome AS cliente_nome, ie.* 
             FROM veiculo v 
             JOIN cliente c ON v.cpfcliente = c.cpf_cliente 
             JOIN inspecao_entrada ie ON v.placa = ie.placa 
             WHERE ie.status = 'aguardando_aprovacao' AND v.cpfcliente = ?`,  [req.session.cpfCliente],
            (error, results) => {
              if (error) {
                console.log('Erro ao buscar veiculos', error);
                res.status(500).send('Erro ao buscar veiculos');
              } else {
                // Obtenha o nome do cliente
                db.query('SELECT nome FROM cliente WHERE cpf_cliente = ?', [req.session.cpfCliente], (nomeError, nomeResults) => {
                  if (nomeError) {
                    console.log('Erro ao buscar nome do cliente', nomeError);
                  } else {
                    // Passe os resultados da consulta e o nome do cliente para a view
                    res.render('aprovar_entrada_cliente', { veiculos: results, nomeCliente: nomeResults[0].nome }); 
                  }
                });
              }
            }
        );
    });
    
    app.post('/aprovar_entrada', (req, res) => {
        const placa = req.body.placa;
        console.log('Placa recebida para aceitação:', placa); // Adicione este console.log

       
    
        // Atualize o status da inspeção de entrada para "Aprovado"
        db.query('UPDATE inspecao_entrada SET status = "Aprovado" WHERE placa = ?', [placa], (error, results) => {
            if (error) {
                console.log('Erro ao aprovar entrada', error);
                res.status(500).send('Erro ao aprovar entrada');
            } else {
                console.log('Entrada aprovada com sucesso');
    
                // Redirecione para a página de aprovação de entrada do cliente
                res.redirect(`/aprovar_entrada_cliente`); 
            }
        });
    });

    
    app.post('/rejeitar_entrada', (req, res) => {
        const placa = req.body.placa;
        console.log('Placa recebida para rejeição:', placa); // Adicione este console.log
    
        // Atualize o status da inspeção de entrada para "Aprovado"
        db.query('UPDATE inspecao_entrada SET status = "rejeitado" WHERE placa = ?', [placa], (error, results) => {
            if (error) {
                console.log('Erro ao rejeitar entrada', error);
                res.status(500).send('Erro ao rejeitar entrada');
            } else {
                console.log('Entrada rejeitada com sucesso');
    
                // Redirecione para a página de aprovação de entrada do cliente
                res.redirect(`/aprovar_entrada_cliente`); 
            }
        });
    });




app.get('/ver_checklist_entrada', (req, res) => {
    const placa = req.query.placa; // Obtenha a placa da query string
  
    // Faça uma consulta ao banco de dados para obter o checklist da inspeção de entrada
    db.query('SELECT * FROM inspecao_entrada WHERE placa = ?', [placa], (error, results) => {
      if (error) {
        console.log('Erro ao buscar checklist', error);
        res.status(500).send('Erro ao buscar checklist');
      } else {
        if (results.length > 0) {
          const inspecao = results[0]; // Obtenha o objeto de inspeção
          res.render('checklist_aprovar', { inspecao: inspecao }); // Renderize a view 'checklist_aprovar_entrada' com os dados da inspeção
        } else {
          res.send('Checklist não encontrado');
        }
      }
    });
  });
  


  app.get('/inspecao_manutencao_pendente', (req,res)=>{
    db.query('SELECT cliente.nome AS nome_cliente, cliente.email, cliente.telefone, veiculo.marca, veiculo.modelo, veiculo.placa, inspecao_entrada.status FROM cliente JOIN veiculo ON cliente.cpf_cliente = veiculo.cpfcliente JOIN inspecao_entrada ON veiculo.placa = inspecao_entrada.placa  WHERE inspecao_entrada.status = "aprovado";', (error,results)=> {
        if(error){
            console.log('não foi possivel exibir os aprovados')
        }else{
            res.render('inspecao_manutencao_pendente', {inspecao_manutencao: results})
        }
    })
  })

  app.get('/realizar_inspecao_manutencao/:placa', (req, res) => {
    const placa = req.params.placa;

    // Consulta no banco de dados
    const sql = `
        SELECT v.*, c.nome AS nome_cliente, c.telefone AS telefone_cliente, c.email AS email_cliente
        FROM veiculo v
        JOIN cliente c ON v.cpfcliente = c.cpf_cliente
        WHERE v.placa = ?;
    `;
    const values = [placa];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao buscar dados do veículo.');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Veículo não encontrado.');
            return;
        }

        const veiculo = results[0];

        // Renderiza o template com os dados do veículo e do cliente
        res.render('realizar_inspecao_manutencao_mecanico', {
            placa: veiculo.placa,
            marca: veiculo.marca,
            modelo: veiculo.modelo,
            cor: veiculo.cor,
            ano: veiculo.ano,
            nome_cliente: veiculo.nome_cliente,
            telefone_cliente: veiculo.telefone_cliente,
            email_cliente: veiculo.email_cliente
        });
    });
});


app.post('/realizar_inspecao_manutencao_a/:placa', (req, res) => {
    const placa = req.params.placa;

    // Verifique se a sessão existe e se a chave 'cpfMecanico' está presente
    if (req.session.hasOwnProperty('cpfMecanico')) {
        const cpfMecanico = req.session.cpfMecanico; 

        // Inserir dados na tabela inspecao_manutencao
        const sqlInsert = `
            INSERT INTO inspecao_manutencao (status, cpfmecanico, placa)
            VALUES ('aguardando_aprovacao', ?, ?);
        `;

        db.query(sqlInsert, [cpfMecanico, placa], (err, result) => {
            if (err) {
                console.error('Erro ao inserir inspeção:', err);
                res.status(500).send('Erro ao processar inspeção.');
                return;
            }

            // Redirecionar para a página de realizar inspeção após a inserção
            res.redirect(`/realizar_inspecao_manutencao/${placa}`);
        });
    } else {
        // Se a sessão não existir ou a chave não estiver presente, redirecione para o login
        res.redirect('/loginMecanico'); 
    }
});


app.post('/cancelar_inspecao_manutencao/:placa', (req, res) => {
    const placa = req.params.placa;

    // Verifica se a sessão existe e se a chave 'cpfMecanico' está presente
    if (req.session.hasOwnProperty('cpfMecanico')) {
        const cpfMecanico = req.session.cpfMecanico; 

        // Delete o registro da tabela inspecao_manutencao baseado no cpfMecanico e na placa
        const sqlDelete = `
            DELETE FROM inspecao_manutencao 
            WHERE cpfmecanico = ? AND placa = ?;
        `;

        db.query(sqlDelete, [cpfMecanico, placa], (err, result) => {
            if (err) {
                console.error('Erro ao cancelar inspeção:', err);
                res.status(500).send('Erro ao cancelar a inspeção.');
                return;
            }

            // Redirecionar para a página de inspeção pendente após o cancelamento
            res.redirect('/inspecao_manutencao_pendente');
        });
    } else {
        // Se a sessão não existir ou a chave não estiver presente, redirecione para o login
        res.redirect('/loginMecanico');
    }
});
