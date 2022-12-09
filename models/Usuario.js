//  Definindo model de usuario #53
//sistema de autenticação
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
  nome:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  //Campo que verifica se o usuario é admin ou não.
  eAdmin:{
    type: Number,
    default: 0
  },
  senha:{
    type: String,
    required: true
  }
})

mongoose.model("usuarios", Usuario)