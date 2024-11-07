    const express = require('express');
    const bodyParser = require('body-parser');
    const mysql = require('mysql2');
    const ejs = require('ejs');
    const path = require('path');
    const { error } = require('console');
    const app = express();
    const port = 3000;

    const session = require('express-session'); // Adicione o módulo express-session
    const res = require('express/lib/response');
const { isReadable } = require('stream');

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

        

            app.get('/home_mecanico', (req, res) => {
                // Verifique se a sessão do mecânico está ativa
                if (!req.session.cpfMecanico) {
                    return res.redirect('/loginMecanico'); // Redireciona para o login se a sessão não existir
                }
            
                const cpfMecanico = req.session.cpfMecanico;
            
                // Consulta o banco de dados para obter os dados do mecânico
                db.query('SELECT * FROM mecanico WHERE cpf_mecanico = ?', [cpfMecanico], (error, results) => {
                    if (error) {
                        console.log('Erro ao buscar dados do mecânico', error);
                        res.status(500).send('Erro ao buscar dados do mecânico');
                    } else {
                        if (results.length > 0) {
                            const mecanico = results[0];
                            res.render('home_mecanico', { mecanico: mecanico }); // Renderiza a view 'home_mecanico' com os dados do mecânico
                        } else {
                            res.send('Mecânico não encontrado');
                        }
                    }
                });
            });



            app.get('/home_adm', (req, res) => {
                // Consulta o banco de dados para obter os dados do administrador
                db.query('SELECT * FROM administrador WHERE email = ?', [req.session.emailAdm], (error, results) => {
                    if (error) {
                        console.log('Erro ao buscar dados do administrador', error);
                        res.status(500).send('Erro ao buscar dados do administrador');
                    } else {
                        if (results.length > 0) {
                            const administrador = results[0];
                            res.render('home_adm', { administrador: administrador }); 
                        } else {
                            res.send('Administrador não encontrado');
                        }
                    }
                });
            });


            app.get('/index1', (req, res) => {
                res.render('index1');
            });


    
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

            app.get('/perfil_mecanico', (req, res) => {
                // Verifique se a sessão do mecânico está ativa
                if (!req.session.cpfMecanico) {
                    return res.redirect('/loginMecanico'); // Redireciona para o login se a sessão não existir
                }
            
                const cpfMecanico = req.session.cpfMecanico;
            
                // Consulta o banco de dados para obter os dados do mecânico
                db.query('SELECT * FROM mecanico WHERE cpf_mecanico = ?', [cpfMecanico], (error, results) => {
                    if (error) {
                        console.log('Erro ao buscar dados do mecânico', error);
                        res.status(500).send('Erro ao buscar dados do mecânico');
                    } else {
                        if (results.length > 0) {
                            const mecanico = results[0];
                            res.render('perfil_mecanico', { mecanico: mecanico }); // Renderiza a view 'perfil_mecanico' com os dados do mecânico
                        } else {
                            res.send('Mecânico não encontrado');
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
                                // Armazene o email na sessão
                                req.session.emailAdm = usuario; 
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

            // Rota para exibir o perfil do administrador
        app.get('/perfil_adm', (req, res) => {
            // Consulta o banco de dados para obter os dados do administrador
            db.query('SELECT * FROM administrador WHERE email = ?', [req.session.emailAdm], (error, results) => {
                if (error) {
                    console.log('Erro ao buscar dados do administrador', error);
                    res.status(500).send('Erro ao buscar dados do administrador');
                } else {
                    if (results.length > 0) {
                        const administrador = results[0];
                        res.render('perfil_adm', { administrador: administrador }); // Renderiza a view 'perfil_adm' com os dados do administrador
                    } else {
                        res.send('Administrador não encontrado');
                    }
                }
            });
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

                    db.query(`SELECT v.*
                        FROM veiculo v
                        JOIN cliente c ON c.cpf_cliente = v.cpfcliente
                        LEFT JOIN inspecao_entrada ie ON ie.placa = v.placa AND ie.status = 'aguardando_aprovacao'
                        WHERE c.cpf_cliente = ? -- CPF do cliente desejado
                        AND ie.id_inspecao_entrada IS NULL;` , [cpfCliente], (veiculoError, veiculoResults) => {
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
                    'INSERT INTO inspecao_entrada (placa, pintura_padrao, limpador_de_para_brisa_dianteiro, marcacao_dos_pneus_traseiro, lentes_do_farol, luz_de_freio, lentes_de_lanterna, luz_de_direcao, nivel_de_agua_no_limpador_de_parabrisa, estado_dos_pneus, porta_traseira_esquerda, porta_traseira_direita, nivel_de_oleo, tag, cinto_de_seguranca, extintor_de_incendio, kit_multimidia_radio_am_fm, macaco, estepe, triangulo_de_seguranca, estofamento, chave_de_roda, certificado_ant, para_lama_dianteiro_direito, para_lama_traseiro_esquerdo, para_lama_traseiro_direito, teto, para_choque_dianteiro, capo_do_motor, para_brisa_dianteiro, vidro_lateral_esquerdo, vidro_lateral_direito, porta_dianteira_esquerda, porta_dianteira_direita, para_lama_dianteiro_esquerdo, para_choque_traseiro, para_brisa_traseiro, nivel_combustivel, tacografo, limpador_para_brisa_traseiro, luz_de_re, bateria, data_hora_entrada, status, cpfmecanico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  CURRENT_TIMESTAMP ,?, ?)',
                    
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



        app.post('/editarFuncionario', (req, res) => {
            const cpf_mecanico = req.body.cpf_mecanico; // CPF usado apenas no WHERE
            const nome = req.body.nome;
            const email = req.body.email;
            const telefone = req.body.telefone;
            const senha = req.body.senha;
            const idoficina = req.body.id_oficina;
            const cpfadm = req.body.cpf_adm;



            db.query('update inspecao_manutencao set id_inspecao_manutencao, cpfmecanico, placa')

            // Atualiza todos os campos, exceto o CPF
            db.query('UPDATE mecanico SET nome = ?, email = ?, telefone = ?, senha = ?, idoficina = ?, cpfadm = ? WHERE cpf_mecanico = ?', 
            [nome, email, telefone, senha, idoficina, cpfadm, cpf_mecanico], 
            (error, results) => {
            if (error) {
                console.log('Erro ao editar funcionário:', error);
                res.status(500).send('Erro ao editar funcionário');
            } else {
                res.redirect('/funcionarios_adm');
                console.log(results);
            }
            });
        });

        app.post('/excluirFuncionario', (req, res) => {
            const cpf_mecanico = req.body.cpf_mecanico;
            const cpf_novo = req.body.cpf_novomec;

            db.query('UPDATE inspecao_manutencao set cpfmecanico = ? where cpfmecanico = ?', [cpf_novo, cpf_mecanico], (error, results) => {
                if(error) {
                    console.log('erro fazer o update', error);
                } else {
                    console.log('Deu tudo certo');
                }

            

            db.query('DELETE FROM mecanico WHERE cpf_mecanico = ?', [cpf_mecanico], (clienteError) => {
                if (clienteError) {
                    console.log('Erro ao excluir funcionario', clienteError);
                    res.status(500).send('Erro ao excluir funcionario');
                    return;
                }

                console.log('Funcionario excluído com sucesso');
                // Redireciona para a página de clientes
                res.redirect('/funcionarios_adm');
            });
        });

        });
        //
        app.get('/fornecedor_adm', (req, res) => {
            db.query('SELECT * FROM fornecedor ORDER BY data_criacao DESC', (error, results) => {
                if (error) {
                    console.log('Erro ao buscar fornecedor', error);
                    res.status(500).send('Erro ao buscar fornecedor');
                } else {
                    res.render('fornecedor_adm', { fornecedores: results });
                }
            });
        });



        app.post('/adicionarFornecedor', (req, res) => {
            const cnpj_fornecedor = req.body.cnpj_fornecedor;
            const nome = req.body.nome_fornecedor;
            const email = req.body.email_fornecedor;
            const telefone = req.body.telefone_fornecedor;
            const endereco = req.body.endereco_fornecedor;
            const id_oficina = req.body.id_oficina;
        
            db.query('INSERT INTO fornecedor (cnpj, nome, telefone, email, endereco, idoficina) VALUES  (?, ?, ?, ?, ?, ?)', 
            [cnpj_fornecedor, nome, telefone, email, endereco, id_oficina], (error, results) => {
                if (error) {
                    console.log('Erro ao cadastrar fornecedor', error);
                } else {
                    console.log(results);
                    console.log('fornecedor cadastrado com sucesso');
                    // Redireciona para a página de clientes
                    res.redirect('/fornecedor_adm');
                }
            });
        });

        
        app.post('/editarFornecedor', (req, res) =>{
            const cnpj = req.body.cnpj_fornecedor;
            const nome = req.body.nome_fornecedor;
            const email = req.body.email_fornecedor;
            const telefone = req.body.telefone_fornecedor;
            const endereco = req.body.endereco_fornecedor;
            const idoficina = req.body.id_oficina;

            db.query('update fornecedor set cnpj = ?, nome = ?, telefone = ?, email = ?, endereco = ?, idoficina = ? where cnpj = ?', [cnpj, nome, telefone, email, endereco, idoficina, cnpj], (error, results) =>{
            if(error){
                console.log('Erro ao editar fornecedor');
                console.log(error);
                
            } else {
                res.redirect('/fornecedor_adm');
                console.log(results);
            
            }
            });
        });


        // Excluir fornecedor
        
        app.post('/excluirFornecedor', (req, res) => {
            const cnpj = req.body.cnpj_fornecedor;

                    // Por fim, exclua o cliente
                    db.query('DELETE FROM fornecedor WHERE cnpj = ?', [cnpj], (clienteError) => {
                        if (clienteError) {
                            console.log('Erro ao excluir fornecedor', clienteError);
                            res.status(500).send('Erro ao excluir cliente');
                            return;
                        }

                        console.log('Cliente excluído com sucesso');
                        // Redireciona para a página de clientes
                        res.redirect('/fornecedor_adm');
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
                        (error, veiculos) => {
                            if (error) {
                                console.log('Erro ao buscar veiculos', error);
                                res.status(500).send('Erro ao buscar veiculos');
                            } else {
                                // Obtenha o nome do cliente
                                db.query('SELECT nome,email FROM cliente WHERE cpf_cliente = ?', [req.session.cpfCliente], (nomeError, nomeResults) => {
                                    if (nomeError) {
                                        console.log('Erro ao buscar nome do cliente', nomeError);
                                    } else {
                                        // Pass both vehicles and client data to the template
                                        res.render('aprovar_entrada_cliente', { 
                                            veiculos: veiculos, 
                                            cliente: nomeResults[0] 
                                        });
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
        

        app.get('/inspecao_manutencao_pendente', (req, res) => {
            const cpfMecanico = req.session.cpfMecanico; // Pega o CPF do mecânico da sessão
        
            db.query(
                `
SELECT 
    cliente.nome AS nome_cliente, 
    cliente.email, 
    cliente.telefone, 
    veiculo.marca, 
    veiculo.modelo, 
    veiculo.placa, 
    inspecao_entrada.status, 
    inspecao_entrada.id_inspecao_entrada 
FROM 
    cliente 
JOIN 
    veiculo ON cliente.cpf_cliente = veiculo.cpfcliente 
JOIN 
    inspecao_entrada ON veiculo.placa = inspecao_entrada.placa 
LEFT JOIN 
    inspecao_manutencao ON inspecao_entrada.id_inspecao_entrada = inspecao_manutencao.id_inspecao_entrada 
LEFT JOIN 
    servico ON inspecao_manutencao.id_inspecao_manutencao = servico.id_inspecao_manutencao 
WHERE 
    inspecao_entrada.status = "aprovado" 
    AND servico.id_inspecao_manutencao IS NULL 
    AND inspecao_entrada.cpfmecanico = ?;
`, 
                [cpfMecanico], // Adiciona a condição para o CPF do mecânico
                (error, results) => {
                    if (error) {
                        console.log('Não foi possível exibir os aprovados');
                    } else {
                        console.log(results)
                        res.render('inspecao_manutencao_pendente', { inspecao_manutencao: results });
                    }
                }
            );
        });
        
        

        app.get('/realizar_inspecao_manutencao/:id_inspecao_entrada', (req, res) => {
            const idInspecaoEntrada = req.params.id_inspecao_entrada; // Recebe o parâmetro id_inspecao_entrada da URL
            
            // Consulta no banco de dados para obter as informações do veículo e do cliente com base no id_inspecao_entrada
            const sql = `SELECT v.*, c.nome AS nome_cliente, c.telefone AS telefone_cliente, c.email AS email_cliente, ie.id_inspecao_entrada
                FROM veiculo v
                JOIN cliente c ON v.cpfcliente = c.cpf_cliente
                JOIN inspecao_entrada ie ON ie.placa = v.placa
                WHERE ie.id_inspecao_entrada = ?;
            `;
            const values = [idInspecaoEntrada];
            
            db.query(sql, values, (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Erro ao buscar dados do veículo.');
                    return;
                }
                
                if (results.length === 0) {
                    res.status(404).send('Inspeção de entrada não encontrada.');
                    return;
                }
                
                const veiculo = results[0];
                
                // Obtenha o inspecaoId do banco de dados (adapte a consulta conforme necessário)
                db.query('SELECT id_inspecao_manutencao FROM inspecao_manutencao WHERE id_inspecao_entrada = ?', [idInspecaoEntrada], (inspecaoError, inspecaoResults) => {
                    if (inspecaoError) {
                        console.error('Erro ao buscar id_inspecao_manutencao:', inspecaoError);
                        res.status(500).send('Erro ao buscar id_inspecao_manutencao.');
                        return;
                    }
                
                    const inspecaoId = inspecaoResults.length > 0 ? inspecaoResults[0].id_inspecao_manutencao : null;
                
                    // Renderiza o template com os dados do veículo, do cliente e o id_inspecao_manutencao
                    res.render('realizar_inspecao_manutencao_mecanico', {
                        placa: veiculo.placa,
                        marca: veiculo.marca,
                        modelo: veiculo.modelo,
                        cor: veiculo.cor,
                        ano: veiculo.ano,
                        nome_cliente: veiculo.nome_cliente,
                        telefone_cliente: veiculo.telefone_cliente,
                        email_cliente: veiculo.email_cliente,
                        inspecaoId: inspecaoId // Passe o id_inspecao_manutencao para o template
                    });
                });
            });
        });
        
        

        app.post('/realizar_inspecao_manutencao_a/:id_inspecao_entrada', (req, res) => {
            const idInspecaoEntrada = req.params.id_inspecao_entrada; // Pega o id_inspecao_entrada da URL
        
            // Verifique se a sessão existe e se a chave 'cpfMecanico' está presente
            if (req.session.hasOwnProperty('cpfMecanico')) {
                const cpfMecanico = req.session.cpfMecanico;
        
                // Inserir dados na tabela inspecao_manutencao com id_inspecao_entrada em vez de placa
                const sqlInsert = `
                    INSERT INTO inspecao_manutencao (status, cpfmecanico, id_inspecao_entrada)
                    VALUES ('aguardando_aprovacao', ?, ?);
                `;
        
                db.query(sqlInsert, [cpfMecanico, idInspecaoEntrada], (err, result) => {
                    if (err) {
                        console.error('Erro ao inserir inspeção:', err);
                        res.status(500).send('Erro ao processar inspeção.');
                        return;
                    }
        
                    // Redirecionar para a página de realizar inspeção após a inserção
                    res.redirect(`/realizar_inspecao_manutencao/${idInspecaoEntrada}`);
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




        app.post('/salvar-servicos', (req, res) => {
            const inspecaoId = req.body.inspecaoId; // Obtenha o inspecaoId do campo oculto
            const servicos = req.body.nome_servico; // Obtenha os nomes dos serviços do array

            // Verifique se a sessão existe e se a chave 'cpfMecanico' está presente
            if (req.session.hasOwnProperty('cpfMecanico')) {
                const cpfMecanico = req.session.cpfMecanico; 

                // Itera sobre cada serviço e insere na tabela servico
                servicos.forEach(nomeServico => {
                    const sqlInsert = `
                        INSERT INTO servico (nome_servico, valor_servico, id_inspecao_manutencao)
                        VALUES (?, 0.00, ?);
                    `;

                    db.query(sqlInsert, [nomeServico, inspecaoId], (err, result) => {
                        if (err) {
                            console.error('Erro ao inserir serviço:', err);
                            // Você pode lidar com o erro de forma mais robusta aqui
                            // Por exemplo, enviar uma mensagem de erro para o usuário
                        } else {
                            console.log('Serviço inserido com sucesso:', nomeServico);
                        }
                    });
                });

                // Após inserir todos os serviços, redireciona para a página de inspeção pendente
                res.redirect('/inspecao_manutencao_pendente');
            } else {
                // Se a sessão não existir ou a chave não estiver presente, redirecione para o login
                res.redirect('/loginMecanico'); 
            }
        });



        app.get('/orcamentos_adm', (req, res) => {
            // Consulta no banco de dados para obter os orçamentos pendentes
            db.query(`
                  SELECT 
            mecanico.nome AS nome_mecanico,
            mecanico.cpf_mecanico,
            COUNT(inspecao_manutencao.id_inspecao_manutencao) AS quantidade_inspecoes
        FROM 
            mecanico
        LEFT JOIN 
            inspecao_manutencao ON mecanico.cpf_mecanico = inspecao_manutencao.cpfmecanico
        LEFT JOIN 
            orcamento ON inspecao_manutencao.id_inspecao_manutencao = orcamento.id_inspecao_manutencao
        WHERE 
            inspecao_manutencao.id_inspecao_manutencao IS NOT NULL -- Garante que a inspeção de manutenção existe
        AND 
            inspecao_manutencao.status = 'aguardando_aprovacao' -- Filtra apenas as inspeções com status 'aguardando_aprovacao'
        GROUP BY 
            mecanico.nome, mecanico.cpf_mecanico


            `, (error, results) => {
                if (error) {
                    console.log('Erro ao buscar orçamentos', error);
                    res.status(500).send('Erro ao buscar orçamentos');
                } else {
                    res.render('orcamentos_adm', { orcamento: results });

                }
            });
        });



















        app.get('/realizar_orcamento/:cpf_mecanico', (req, res) => {
            const cpfMecanico = req.params.cpf_mecanico;
        
            // Consulta para buscar o nome e telefone do mecânico
            db.query('SELECT * FROM mecanico WHERE cpf_mecanico = ?', [cpfMecanico], (error, mecanicoResults) => {
                if (error) {
                    console.log('Erro ao buscar dados do mecânico:', error);
                    res.status(500).send('Erro ao buscar dados do mecânico');
                    return;
                }
        
                if (mecanicoResults.length === 0) {
                    console.log('Mecânico não encontrado');
                    res.status(404).send('Mecânico não encontrado');
                    return;
                }
        
                const mecanico = mecanicoResults[0];
        
                // Consulta para buscar os veículos com inspeções em aberto (sem orçamento) para o mecânico específico
                db.query(`
                        SELECT 
    v.placa,
    v.marca,
    v.modelo,
    v.cor,
    v.ano,
    im.id_inspecao_manutencao,
    im.id_inspecao_entrada,  -- Garanta que esse campo esteja sendo selecionado
    im.status
FROM 
    veiculo v
JOIN 
    inspecao_entrada ie ON v.placa = ie.placa
JOIN 
    inspecao_manutencao im ON ie.id_inspecao_entrada = im.id_inspecao_entrada
WHERE 
    ie.cpfmecanico = '67382956145' -- Filtra pela condição do CPF do mecânico na inspeção de entrada
    AND im.status = 'aguardando_aprovacao'; -- Filtra apenas inspeções com status 'aguardando_aprovacao'


                `, [cpfMecanico], (error, veiculoResults) => {
                    if (error) {
                        console.log('Erro ao buscar veículos:', error);
                        res.status(500).send('Erro ao buscar veículos');
                        return;
                    }
        
                    res.render('orcamentos_mecanico_adm', { 
                        mecanico: mecanico, // Dados do mecânico
                        veiculos: veiculoResults // Veículos com inspeções em aberto do mecânico específico
                    });
                });
            });
        });
        









   // Rota para definir o preço do orçamento
app.get('/definir_preco_orcamento/:id_inspecao_entrada/:id_inspecao_manutencao', (req, res) => {
    const idInspecaoEntrada = req.params.id_inspecao_entrada;
    const idInspecaoManutencao = req.params.id_inspecao_manutencao;

    // Consulta no banco de dados para obter os dados do veículo e do cliente
    db.query(`
        SELECT 
            v.placa, v.marca, v.modelo, v.cor, v.ano,
            c.nome AS nome_cliente, c.telefone AS telefone_cliente, c.email AS email_cliente,
            im.id_inspecao_manutencao
        FROM 
            veiculo v
        JOIN 
            cliente c ON v.cpfcliente = c.cpf_cliente
        JOIN 
            inspecao_entrada ie ON v.placa = ie.placa
        JOIN 
            inspecao_manutencao im ON ie.id_inspecao_entrada = im.id_inspecao_entrada
        WHERE 
            ie.id_inspecao_entrada = ?
    `, [idInspecaoEntrada], (error, results) => {
        if (error) {
            console.log('Erro ao buscar dados do veículo e cliente:', error);
            res.status(500).send('Erro ao buscar dados do veículo e cliente');
            return;
        }

        if (results.length === 0) {
            console.log('Veículo não encontrado');
            res.status(404).send('Veículo não encontrado');
            return;
        }

        const veiculo = results[0];

        // Consulta para obter os serviços da inspeção de manutenção
        db.query('SELECT * FROM servico WHERE id_inspecao_manutencao = ?', [idInspecaoManutencao], (error, servicos) => {
            if (error) {
                console.log('Erro ao buscar serviços:', error);
                res.status(500).send('Erro ao buscar serviços');
                return;
            }

            // Renderiza a view 'definir_preco_orcamento' com os dados do veículo, cliente e serviços
            res.render('definir_preco_adm', {
                veiculo: veiculo,
                servicos: servicos
            });
        });
    });
});


    // 



    app.post('/definir_valor_servico', (req, res) => {
        console.log(req.body); // Verifique o que está sendo enviado
    
        const servicos = req.body; // Captura os serviços enviados pelo formulário
        let totalValue = 0; // Inicializa o total
        const idInspecaoManutencao = req.body.id_inspecao_manutencao; // Captura o ID da inspeção de manutenção do formulário
    
        if (!idInspecaoManutencao) {
            return res.status(400).send('ID da inspeção de manutenção não fornecido'); // Retorna erro se o ID não for fornecido
        }
    
        // Itera pelos serviços e atualiza o valor no banco de dados
        for (const [nomeServico, valorServico] of Object.entries(servicos)) {
            if (nomeServico !== 'totalValue' && nomeServico !== 'id_inspecao_manutencao') { // Ignora os campos totalValue e id_inspecao_manutencao
                const valorNumerico = parseFloat(valorServico.replace('.', '').replace(',', '.')); // Converte para número decimal
                totalValue += valorNumerico; // Acumula o total
    
                // Atualiza o valor do serviço no banco de dados
                const sqlUpdate = 'UPDATE servico SET valor_servico = ? WHERE nome_servico = ?';
                db.query(sqlUpdate, [valorNumerico, nomeServico], (err, result) => {
                    if (err) {
                        console.error('Erro ao atualizar o serviço:', err);
                    } else {
                        console.log(`Serviço ${nomeServico} atualizado com sucesso`);
                    }
                });
            }
        }
    
        // Obtém o CPF do administrador com uma consulta ao banco de dados
        const sqlSelect = 'SELECT cpf_adm FROM administrador'; // Seleciona o CPF do único administrador
        db.query(sqlSelect, (err, result) => {
            if (err) {
                console.error('Erro ao obter o CPF do administrador:', err);
                return res.status(500).send('Erro ao processar o orçamento'); // Responde com erro
            }
    
            if (result.length > 0) {
                const cpfAdm = result[0].cpf_adm; // Obtém o CPF do primeiro (e único) administrador
    
                // Insere um novo orçamento na tabela orcamento
                const sqlInsert = 'INSERT INTO orcamento (valor_total, status, id_administrador, id_inspecao_manutencao) VALUES (?, ?, ?, ?)';
                db.query(sqlInsert, [totalValue, 'aguardando_aprovacao', cpfAdm, idInspecaoManutencao], (err, result) => {
                    if (err) {
                        console.error('Erro ao inserir o orçamento:', err);
                        return res.status(500).send('Erro ao processar o orçamento'); // Responde com erro
                    } else {
                        console.log('Orçamento inserido com sucesso');
    
                        // Atualiza o status da inspeção de manutenção para 'aprovado'
                        const sqlUpdateInspecao = 'UPDATE inspecao_manutencao SET status = ? WHERE id_inspecao_manutencao = ?';
                        db.query(sqlUpdateInspecao, ['aprovado', idInspecaoManutencao], (err, result) => {
                            if (err) {
                                console.error('Erro ao atualizar o status da inspeção de manutenção:', err);
                                return res.status(500).send('Erro ao atualizar o status da inspeção de manutenção'); // Responde com erro
                            } else {
                                console.log('Status da inspeção de manutenção atualizado para aprovado');
    
                                // Redireciona de volta para a página de orçamento após a atualização
                                res.redirect('/home_adm');
                            }
                        });
                    }
                });
            } else {
                console.error('Nenhum administrador encontrado.');
                return res.status(404).send('Administrador não encontrado'); // Responde com erro
            }
        });
    });
    

    app.get('/aprovar_orcamento_cliente', (req, res) => {
        // Verifique se o cliente está autenticado
        if (!req.session.cpfCliente) {
            return res.redirect('/loginCliente'); // Redirecione para o login se não estiver autenticado
        }

        // Faça uma consulta ao banco de dados para obter os veículos com orçamentos em aberto
        db.query(`
        
 SELECT 
    veiculo.placa,
    veiculo.marca,
    veiculo.modelo,
    veiculo.cor,
    veiculo.ano,
    inspecao_entrada.data_hora_entrada,
    inspecao_manutencao.id_inspecao_manutencao  
FROM 
    veiculo
JOIN 
    cliente ON veiculo.cpfcliente = cliente.cpf_cliente
JOIN 
    inspecao_entrada ON veiculo.placa = inspecao_entrada.placa
JOIN 
    inspecao_manutencao ON inspecao_entrada.id_inspecao_entrada = inspecao_manutencao.id_inspecao_entrada
JOIN 
    orcamento ON inspecao_manutencao.id_inspecao_manutencao = orcamento.id_inspecao_manutencao
WHERE 
    cliente.cpf_cliente = ? 
    AND inspecao_entrada.data_hora_entrada >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    AND orcamento.status NOT IN ('aprovado', 'rejeitado');



        `, [req.session.cpfCliente], (error, results) => {
            if (error) {
                console.log('Erro ao consultar dados:', error);
                return res.status(500).send('Erro ao consultar dados');
            }

            // Consulta para obter veículos com inspeções de entrada há mais de um mês
            db.query(`
       SELECT 
    veiculo.placa,
    veiculo.marca,
    veiculo.modelo,
    veiculo.cor,
    veiculo.ano,
    inspecao_entrada.data_hora_entrada,
    inspecao_manutencao.id_inspecao_manutencao  
FROM 
    veiculo
JOIN 
    cliente ON veiculo.cpfcliente = cliente.cpf_cliente
JOIN 
    inspecao_entrada ON veiculo.placa = inspecao_entrada.placa
JOIN 
    inspecao_manutencao ON inspecao_entrada.id_inspecao_entrada = inspecao_manutencao.id_inspecao_entrada
JOIN 
    orcamento ON inspecao_manutencao.id_inspecao_manutencao = orcamento.id_inspecao_manutencao
WHERE 
    cliente.cpf_cliente = ? 
    AND inspecao_entrada.data_hora_entrada < DATE_SUB(NOW(), INTERVAL 1 MONTH);


            `, [req.session.cpfCliente], (error, expiredResults) => {
                if (error) {
                    console.log('Erro ao consultar dados expirados:', error);
                    return res.status(500).send('Erro ao consultar dados expirados');
                }

                // Obtenha o nome do cliente
                db.query('SELECT nome, email FROM cliente WHERE cpf_cliente = ?', [req.session.cpfCliente], (nomeError, nomeResults) => {
                    if (nomeError) {
                        console.log('Erro ao buscar nome do cliente', nomeError);
                        return res.status(500).send('Erro ao buscar nome do cliente');
                    }

                    // Passe os resultados da consulta e o nome do cliente para a view
                    const cliente = {
                        nome: nomeResults.length > 0 ? nomeResults[0].nome : 'Cliente não encontrado',
                        email: nomeResults.length > 0 ? nomeResults[0].email : 'Email não encontrado',
                    };

                    res.render('aprovar_orcamento_cliente', { 
                        veiculos: results, 
                        cliente, 
                        veiculosExpirado: expiredResults // Passa os resultados expirados para a view
                    });
                });
            });
        });
    });

    app.get('/checklist_aprovar_orcamento/:id_inspecao_manutencao', (req, res) => {
        const idInspecaoManutencao = req.params.id_inspecao_manutencao;
    
        // Consulta para obter os dados do veículo e do cliente
        db.query(`
            SELECT 
    s.nome_servico,
    s.valor_servico,
    c.nome AS nome_cliente,
    c.email AS email_cliente,
    o.valor_total,
    v.placa, v.marca, v.modelo, v.cor, v.ano,
    im.id_inspecao_manutencao,
    ie.id_inspecao_entrada  -- Adicionando o id da inspeção de entrada
FROM 
    veiculo v
JOIN 
    inspecao_entrada ie ON v.placa = ie.placa
JOIN 
    inspecao_manutencao im ON ie.id_inspecao_entrada = im.id_inspecao_entrada
JOIN 
    servico s ON im.id_inspecao_manutencao = s.id_inspecao_manutencao
JOIN 
    orcamento o ON im.id_inspecao_manutencao = o.id_inspecao_manutencao
JOIN 
    cliente c ON v.cpfcliente = c.cpf_cliente
WHERE 
    im.id_inspecao_manutencao = ?;
        `, [idInspecaoManutencao], (error, result) => {
            if (error) {
                console.error("Erro ao buscar dados:", error);
                return res.status(500).send("Erro ao buscar dados.");
            }
    
            if (result.length === 0) {
                return res.status(404).send("Nenhum orçamento encontrado para esta inspeção.");
            }
    
            // Calcula o valor total somando todos os serviços
            const valorTotal = result.reduce((total, item) => total + parseFloat(item.valor_servico), 0);
    
            // Inclua o objeto veiculo no contexto da view
            const veiculo = {
                placa: result[0].placa,
                marca: result[0].marca,
                modelo: result[0].modelo,
                cor: result[0].cor,
                ano: result[0].ano,
                id_inspecao_manutencao: result[0].id_inspecao_manutencao,
                id_inspecao_entrada: result[0].id_inspecao_entrada  // Adicionando o id da inspeção de entrada
            };
    
            res.render('checklist_aprovar_orcamento', {
                servicos: result, // envia todos os serviços encontrados
                cliente: {
                    nome: result[0].nome_cliente,
                    email: result[0].email_cliente,
                },
                valor_total: valorTotal.toFixed(2), // Define o valor total para exibir
                veiculo: veiculo // Passe o objeto veiculo para a view
            });
        });
    });
    

    app.post('/aprovar_orcamento_cliente', (req, res) => {
        console.log(req.body); // Verifique o que está sendo enviado
    
        const servicos = req.body.servicos_selecionados; // Captura os serviços enviados pelo formulário
        const idInspecaoManutencao = req.body.id_inspecao_manutencao; // Captura o ID da inspeção de manutenção do formulário
        const valorTotal = parseFloat(req.body.valor_total); // Captura o valor total do formulário
    
        if (!idInspecaoManutencao) {
            return res.status(400).send('ID da inspeção de manutenção não fornecido'); // Retorna erro se o ID não for fornecido
        }
    
        const servicosSelecionados = JSON.parse(servicos).map(servico => servico.nome_servico); // Obter nomes dos serviços selecionados
        const sqlDelete = 'DELETE FROM servico WHERE id_inspecao_manutencao = ? AND nome_servico NOT IN (?)';
            
        db.query(sqlDelete, [idInspecaoManutencao, servicosSelecionados], (err, result) => {
            if (err) {
                console.error('Erro ao excluir serviços:', err);
                return res.status(500).send('Erro ao processar o orçamento');
            }
            console.log('Serviços não selecionados excluídos com sucesso');
        });
    
        let totalValue = 0;
        servicosSelecionados.forEach(nomeServico => {
            const valor = servicos[nomeServico] ? servicos[nomeServico].replace('.', '').replace(',', '.') : null;
            
            if (valor) {
                const valorServico = parseFloat(valor);
                totalValue += valorServico;
                
                const sqlUpdate = 'UPDATE servico SET valor_servico = ? WHERE nome_servico = ? AND id_inspecao_manutencao = ?';
                db.query(sqlUpdate, [valorServico, nomeServico, idInspecaoManutencao], (err, result) => {
                    if (err) {
                        console.error('Erro ao atualizar o serviço:', err);
                        return res.status(500).send('Erro ao processar o orçamento');
                    }
                    console.log(`Serviço ${nomeServico} atualizado com sucesso`);
                });
            } else {
                console.warn(`Serviço "${nomeServico}" não encontrado ou sem valor.`);
            }
        });
    
        const sqlSelect = 'SELECT cpf_adm FROM administrador';
        db.query(sqlSelect, (err, result) => {
            if (err) {
                console.error('Erro ao obter o CPF do administrador:', err);
                return res.status(500).send('Erro ao processar o orçamento');
            }
    
            if (result.length > 0) {
                const cpfAdm = result[0].cpf_adm;
    
                // Atualiza o valor total e o status do orçamento para "aprovado"
                const sqlUpdate = 'UPDATE orcamento SET valor_total = ?, status = "aprovado" WHERE id_inspecao_manutencao = ?';
                db.query(sqlUpdate, [valorTotal, idInspecaoManutencao], (err, result) => {
                    if (err) {
                        console.error('Erro ao atualizar o valor total e o status do orçamento:', err);
                        return res.status(500).send('Erro ao processar o orçamento');
                    }
                    console.log('Valor total e status do orçamento atualizados com sucesso');
    
                    // Redireciona de volta para a página de orçamento após a atualização
                    res.redirect('/aprovar_orcamento_cliente');
                });
            } else {
                console.error('Nenhum administrador encontrado.');
                return res.status(404).send('Administrador não encontrado');
            }
        });
    });
    
    

// Rota para rejeitar orçamento
app.post('/rejeitar_orcamento_cliente', (req, res) => {
    const  id_inspecao_manutencao  = req.body.id_inspecao_manutencao;

    db.query('UPDATE orcamento SET status = "rejeitado" WHERE id_inspecao_manutencao = ?', [id_inspecao_manutencao], (error,results)=>{
        if(error){
            console.log(error)
        }else{
            res.redirect('/aprovar_orcamento_cliente')
        }
    }
)

});





    

    app.get('/manutencoes_andamento', (req, res) => {
    const cpfMecanico = req.session.cpfMecanico; // Obtenha o CPF do mecânico da sessão

    if (!cpfMecanico) {
        return res.redirect('/loginMecanico'); // Redireciona para o login se a sessão não existir
    }

    // Consulta SQL para buscar manutenções em andamento
    const sql = `
  SELECT 
    v.placa, 
    v.marca, 
    v.modelo, 
    v.cor, 
    v.ano, 
    o.id_orcamento 
FROM 
    veiculo v
JOIN 
    cliente c ON v.cpfcliente = c.cpf_cliente
JOIN 
    inspecao_entrada ie ON v.placa = ie.placa
JOIN 
    inspecao_manutencao im ON ie.id_inspecao_entrada = im.id_inspecao_entrada
JOIN 
    orcamento o ON im.id_inspecao_manutencao = o.id_inspecao_manutencao
WHERE 
    o.status = 'Aprovado'
    AND NOT EXISTS (
        SELECT 1 
        FROM manutencao m 
        WHERE m.id_orcamento = o.id_orcamento
    );
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.log('Erro ao buscar manutenções em andamento', error);
            res.status(500).send('Erro ao buscar manutenções em andamento');
        } else {
            res.render('manutencoes_andamento', { veiculos: results }); // Renderiza a página com os resultados
        }
    });
});

    app.get('/reparos_veiculo_mecanico/:id_orcamento', (req, res) => {
        const idOrcamento = req.params.id_orcamento;
    
        // Primeira consulta para obter dados do veículo, cliente e orçamento
        db.query(`
              SELECT 
    v.placa, 
    v.marca, 
    v.modelo, 
    v.cor, 
    v.ano,
    c.nome AS nome_cliente, 
    c.telefone AS telefone_cliente, 
    c.email AS email_cliente,
    o.id_orcamento, 
    o.status AS status_orcamento,
    im.id_inspecao_manutencao
FROM 
    veiculo v
JOIN 
    inspecao_entrada ie ON v.placa = ie.placa
JOIN 
    inspecao_manutencao im ON ie.id_inspecao_entrada = im.id_inspecao_entrada
JOIN 
    orcamento o ON im.id_inspecao_manutencao = o.id_inspecao_manutencao
JOIN 
    cliente c ON v.cpfcliente = c.cpf_cliente
WHERE 
    o.id_orcamento = ?;
        `, [idOrcamento], (error, results) => {
            if (error) {
                console.log('Erro ao buscar dados do veículo e cliente:', error);
                res.status(500).send('Erro ao buscar dados do veículo e cliente');
                return;
            }
    
            // Verifica se encontrou algum resultado
            if (results.length === 0) {
                console.log('Orçamento não encontrado');
                res.status(404).send('Orçamento não encontrado');
                return;
            }
    
            const veiculo = results[0];
            console.log('Dados do veículo e cliente:', veiculo);  // Exibe dados para depuração
    
            // Segunda consulta para obter serviços vinculados ao id_inspecao_manutencao
            db.query('SELECT * FROM servico WHERE id_inspecao_manutencao = ?', [veiculo.id_inspecao_manutencao], (error, servicos) => {
                if (error) {
                    console.log('Erro ao buscar serviços:', error);
                    res.status(500).send('Erro ao buscar serviços');
                    return;
                }
    
                console.log('Serviços encontrados:', servicos); // Exibe serviços para depuração
    
                // Renderiza a view 'reparos_veiculo_mecanico' com os dados do veículo, cliente e serviços
                res.render('reparos_veiculo_mecanico', {
                    veiculo: veiculo,
                    servicos: servicos
                });
            });
        });
    });
    

    app.post('/finalizar_manutencao', (req, res) => {
        if (!req.session.cpfMecanico) {
            return res.redirect('/loginMecanico'); // Redireciona para o login se a sessão não existir
        }
    
        const cpfMecanico = req.session.cpfMecanico;
        const { id_orcamento, placa } = req.body; // Extraindo id_orcamento e placa do corpo da requisição
    
        // Cria o comando SQL para inserir na tabela `manutencao`
        const sql = `
            INSERT INTO manutencao (status, data_fim, cpf_mecanico, id_orcamento, placa)
            VALUES ('finalizado', NOW(), ?, ?, ?)
        `;
    
        db.query(sql, [cpfMecanico, id_orcamento, placa], (error, results) => {
            if (error) {
                console.error('Erro ao inserir dados na tabela manutencao:', error);
                return res.status(500).send('Erro ao finalizar a manutenção');
            }
    
            // Redireciona para a página home do mecânico em caso de sucesso
            res.redirect('home_mecanico');
        });
    });
    
    app.get('/manutencoes_finalizadas_mecanico', async (req, res) => {
        try {
            // Consulta para buscar os veículos e dados do cliente com manutenção finalizada
            const query = `
                SELECT 
                    v.placa, 
                    v.marca, 
                    v.modelo, 
                    v.cor, 
                    v.ano,
                    c.nome AS nome_cliente, 
                    c.telefone AS telefone_cliente, 
                    c.email AS email_cliente,
                    m.status AS status_manutencao
                FROM 
                    veiculo v
                JOIN 
                    manutencao m ON v.placa = m.placa
                JOIN 
                    cliente c ON v.cpfcliente = c.cpf_cliente
                WHERE 
                    m.status = 'finalizado';
            `;
            
            db.query(query, (error, results) => {
                if (error) {
                    console.log('Erro ao buscar manutenções finalizadas:', error);
                    res.status(500).send('Erro ao buscar manutenções finalizadas');
                    return;
                }
                
                // Renderiza a página passando os dados das manutenções finalizadas
                res.render('manutencoes_finalizadas_mecanico', { veiculos: results });
            });
        } catch (error) {
            console.error('Erro no servidor:', error);
            res.status(500).send('Erro interno do servidor');
        }
    });
    





    app.get('/meu_veiculo_cliente', (req, res) => {
        // Verifique se a sessão do cliente está ativa
        if (!req.session.cpfCliente) {
            return res.redirect('/loginCliente'); // Redireciona para o login se a sessão não existir
        }
    
        const cpfCliente = req.session.cpfCliente;
    
        // Consulta o banco de dados para obter os veículos do cliente e os dados do cliente
        db.query(`
            SELECT 
                v.placa,
                v.marca,
                v.modelo,
                v.cor,
                v.ano,
                ie.id_inspecao_entrada, -- Adicione este campo
                ie.data_hora_entrada, -- Acessa a data e hora da entrada do carro
                ie.status AS status_inspecao,
                c.nome, -- Nome do cliente
                c.email -- Email do cliente
            FROM 
                veiculo v
            JOIN 
                inspecao_entrada ie ON ie.placa = v.placa
            JOIN 
                cliente c ON c.cpf_cliente = v.cpfcliente -- JOIN para obter dados do cliente
            WHERE 
                v.cpfcliente = ? -- CPF específico do cliente
                AND ie.status = 'Aprovado'; -- Condição para mostrar apenas veículos com status "Aprovado"
        `, [cpfCliente], (error, results) => {
            if (error) {
                console.log('Erro ao buscar veículos e dados do cliente', error);
                res.status(500).send('Erro ao buscar veículos e dados do cliente');
            } else {
                const veiculos = results.map(row => ({
                    placa: row.placa,
                    marca: row.marca,
                    modelo: row.modelo,
                    cor: row.cor,
                    ano: row.ano,
                    id_inspecao_entrada: row.id_inspecao_entrada,
                    data_hora_entrada: row.data_hora_entrada,
                    status_inspecao: row.status_inspecao
                }));
    
                // Dados do cliente
                const cliente = {
                    nome: results[0]?.nome, // Garante que pegue o nome do primeiro resultado
                    email: results[0]?.email // Garante que pegue o email do primeiro resultado
                };
    
                // Renderiza a página e passa os veículos e o cliente para o template EJS
                res.render('meu_veiculo_cliente', { veiculos, cliente });
            }
        });
    });
    
        


    app.get('/editar_perfil_cliente/:email', (req, res) => {
        const email = req.params.email; // Acessa o email do cliente
    
        db.query(`SELECT * FROM cliente WHERE email = ?`, [email], (error, results) => {
            if (error) {
                console.log('deu erro');
            } else {
                // Verifica se há resultados e passa o primeiro elemento como cliente
                if (results.length > 0) {
                    res.render('editar_perfil_cliente', { cliente: results[0] });
                } else {
                    // Trate o caso em que nenhum cliente é encontrado, se necessário
                    console.log('Cliente não encontrado');
                    res.send('Cliente não encontrado');
                }
            }
        });
    });
    
    


    app.post('/editar_senha_cliente/:email', (req, res) => {
        const email = req.params.email;
        const novaSenha = req.body.newPassword;
        const confirmaSenha = req.body.confirmPassword;
      
        // Verifica se as duas senhas são iguais
        if (novaSenha !== confirmaSenha) {
          // Se as senhas não forem iguais, exibe uma mensagem de erro
          return res.render('editar_perfil_cliente', { cliente: { email: email }, erro: 'As senhas não coincidem!' });
        }
      
        // Atualiza a senha do cliente no banco de dados
        const sql = 'UPDATE cliente SET senha = ? WHERE email = ?';
        db.query(sql, [novaSenha, email], (error, results) => {
          if (error) {
            console.log('Erro ao atualizar a senha do cliente:', error);
            return res.status(500).send('Erro ao atualizar a senha');
          }
      
          // Redireciona para a página de perfil do cliente
          res.redirect(`/editar_perfil_cliente/${email}`);
        });
      });
        
        app.get('/acompanhar_cliente', (req, res) => {
            res.render('acompanhar_cliente');
        });


