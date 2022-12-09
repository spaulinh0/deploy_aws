//definindo model de postagens #44
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
  titulo: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  //Aqui vai armazenar o id de uma categoria #44
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    required: true
  },
  data:{
    type: Date,
    default: Date.now()
  }

})

mongoose.model("postagens", Postagem)