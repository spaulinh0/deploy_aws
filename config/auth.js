//  Configurando o Passport #58

//Carregando estratégia local 
const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
//Carregando o bcrypt, para comparar senhas. 
const bcrypt = require("bcryptjs")

//  Model de usuário
require("../models/Usuario")
//Declarando const
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
  //{usernameField: 'email'} aqui quer dizer: Qual campo você quer analizar.
  //(email, senha, done) função de call back.
  //(passwordField:"senha"): Serve para reconhecer o campo senha do input, pq passport trabalha com tudo só em inglês. #59
  passport.use(new localStrategy({usernameField: 'email', passwordField:"senha"}, (email, senha, done) => {
    //Pequisa um usuário que tenha o email igual ao email que for passado na autenticão.
    Usuario.findOne({email: email}).then((usuario) => {
      //( !usuario ): se não encontrar o usuario.
      if(!usuario){
      //(done): recebe 3 parâmetros >> 1- Os dados da conta que foi altenticada, no caso( null) pq nehuma foi altenticada. 
      //2- se a altenticação aconteceu com sucesso ou não, (false) pq não ocorreu com sucesso, e uma menssagem no final 3-(message). 
        return done(null, false, {message: "Essa conta não existe"})
      }
      //Se a conta existir, passa para o (bcrypt.compare).
      //bcrypt.compare(senha, usuario.senha) isso compara dois valores incriptados.
      bcrypt.compare(senha, usuario.senha, (erro, batem) => {
      //Verificando se as senhas são iguais ou não.
        if(batem){
          return done(null, usuario)
        }else{
          return done(null, false,{message: "Senha incorreta"})
        }
      })
    })
  }))

    //Salva os dados de um usuario em uma sessaõ.
    passport.serializeUser((usuario, done) => {
      done(null, usuario.id)
    })

    //Tambem salva os dados do usuário em uma sessão.
    passport.deserializeUser((id, done) => {
      //findById proucura um usuário pelo id.
      Usuario.findById(id, (err, usuario) => {
          done(err, usuario)
      })
    })

}
