//  Registro de usuários #54
//Chamando o express
const express = require('express')
//Declarando router
const router = express.Router()
//Carregando o mongoose
const mongoose = require('mongoose')
//Chamando o model de usuario
require("../models/Usuario")
//Declarando usuario
const Usuario = mongoose.model("usuarios")
//Importando bcryptjs
const bcrypt = require("bcryptjs")
//Carregando o passport #59
const passport = require("passport")
const eAdmin = require('../helpers/eAdmin')


router.get("/registro", (req, res) => {
  res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
//Validação do regitro #54
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
  }

  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
    erros.push({texto: "E-mail inválido"})
  }
  
  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
    erros.push({texto: "Senha inválido"})
  }
  
  if(req.body.senha.length < 4 ){
    erros.push({texto: "Senha muito curta"})
  }

  if(req.body.senha != req.body.senha2 ){
    erros.push({texto: "As senhas são diferentes, tente novamente!"})
  }
  //Verifica se existe algum erro
  if(erros.length > 0){
    res.render("usuarios/registro", {erros: erros})
  }else{
//Verifica se o E-mail que está sendo cadastrado não existe outro igual. #56
    Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
      if(usuario){
          req.flash("error_msg", "Já existe uma conta com esse E-mail em nosso sistema.")
          res.redirect("/usuarios/registro")
      }else{
        //Salva o novo usuario #56
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha
        })
        //Incriptação da senha.
        // (genSalt) Essa função gera um Salt.
        //Salt é um valor aleatorio com varios carateres que é misturado com seu hash, para que não seja hackeado.
        bcrypt.genSalt(10, (erro, salt) => {
          //(hash) Essa função gera um hash
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            //Verifica se aconteceu algun erro.
            if(erro){
              req.flash("error_msg", "Houve um erro durante o salvamento")
              res.redirect("/")
            }
            //Pega a senha de novoUsuario e diz que vai ser igual ao hash que foi gerado.
            novoUsuario.senha = hash
            //Salvando senha Incriptada.
            novoUsuario.save().then(() => {
              req.flash("success_msg", "Usuario criado com sucesso!")
              res.redirect("/")
            }).catch((err) => {
              req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente! ")
              res.redirect("/usuarios/registro")
              })
          })
        })
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/")
    })
  }
})

router.get("/login", (req, res) => {
  res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
//(authenticate): Essa função serve para autenticar alguma coisa. #59
  passport.authenticate("local", {
  //Redireciona para algun caminho caso a altenticação tenha ocorrido com sucesso.
    successRedirect: "/",
  //Caso ocorra algun erro redireciona para algun caminho 
    failureRedirect: "/usuarios/login",
  //Habilita as menssagens flash. 
    failureFlash: true
  })(req, res, next)
})

// Logout #61
router.get("/logout", (req, res, next) => {

  req.logout(function(err) {
    if (err) { return next(err) }
    req.flash('success_msg', "Deslogado com sucesso!")
    res.redirect('/')
  })
})


module.exports = router