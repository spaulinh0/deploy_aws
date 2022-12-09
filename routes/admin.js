//Grupo de rotas no Express.js #32
// Guardando rotas de admin dentro desse arquivo.
//Chamando o express.
const express = require("express")
console.log('Funcionando 1')
//Componete usado para criar rotas em arquivos separados.
const router = express.Router()
console.log('Funcionando 2')
// Carregando o mongoose #36
//Usando um model de forma externa dentro do mongoose.
const mongoose = require("mongoose")
console.log('Funcionando 3')
//Acessa o aquivo Categoria dentro da pasta models.
require("../models/Categoria")
console.log('Funcionando 4')
//Passa uma refencia do model para uma variavel.
const Categoria = mongoose.model("categorias")
//Carregando model de postagem #46
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
//Carregando helers.
//({eAdmin}) isso pega a função eAdmin: do objeto eAdmin do arquivo eAdmin na pasta helpers. #60
const {eAdmin} = require("../helpers/eAdmin")
console.log('Funcionando 5')

// Definindo rotas
router.get('/', eAdmin, (req, res) => {
  res.render("admin/index")
})
console.log('Funcionando 6')
router.get('/posts', eAdmin, (req, res) => {
  res.send("Página de posts")
})
console.log('Funcionando 7')
router.get('/categorias', eAdmin, (req, res) => {
  // Listando categorias #41
  //Categoria.find(): lista todas as categorias que existe. 
  Categoria.find().lean().sort({data:'desc'}).then((categorias) => {
    res.render("admin/categorias", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/admin")
  })
})

console.log('Funcionando 8')
router.get('/categorias/add', eAdmin, (req, res) => {
  res.render("admin/addcategorias")
})
console.log('Funcionando 9')

// NOVA ROTA
router.post("/categorias/nova", eAdmin, (req, res) => {
  //Como validar formulários no Express.js #40
  //Aqui fica armazenados os erros.
  var erros = []

  // Validação do campo nome
  //(req.body.nome) aqui são os dados que vem do formilário.
  //( !req.body.nome ) isso quer se não foi enviado um nome, ou se campo nome for vazio.
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    //Add esse objeto no array erros.
    erros.push({texto: "Nome inválido"})
  }
    // Validação do campo slug
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    //Add esse objeto no array erros.
    erros.push({texto: "Slug inválido"})
  }
  // Valida se o nome da categoria é muito pequeno.
  if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria é muito pequeno"})
  }
  // Verifica se ouve algum erro
  // E passa para a (view addcategorias) o array de erros.
  if(erros.length > 0) {
    res.render("admin/addcategorias", {erros: erros})
  //Se não ouver erros será criada uma nova categoria.
  }else{
    const novaCategoria = {
      //(nome e slug) fazem referência aos input no arquivo (addcategorias) e o conteúdo desses campos...
      //são guardado dentro da const (novaCategoria) #36
       nome: req.body.nome,
       slug: req.body.slug
     }
     //Criando uma nova categoria #36
     //Se o cadastro ocorre com sucesso a pagína vai redirecionada pa pagina (admin/categorias)
     new Categoria(novaCategoria).save().then(() => {
      //Passa a mensagem para a variavel global (success_msg) caso dê certo. ela é exibida pelo arquivo (_msg.hamdlebars) #40
      req.flash("success_msg", "Categoria criada com sucesso!")
      res.redirect("/admin/categorias")
     }).catch((err) => {
      //Passa a mensagem para a variavel global (error_msg) caso der erro. ela é exibida pelo arquivo (_msg.hamdlebars)
      req.flash("error_msg", "Houve um erro ao criar a categoria, tente novamente!")
      res.redirect("/admin")
     })
  }
})
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
    res.render("admin/editcategorias", {categoria: categoria})
  }).catch((err) => {
    req.flash('error_msg', 'Esta categoria não existe')
    res.redirect("/admin/categorias")
  })
})

//Rota de edição de categoria.
router.post("/categorias/edit", eAdmin, (req, res) => {

  //Depois fazer um sistema de validação para essa rota #42

  //Aqui pega o campo hidden de name id no arq. (editcategorias)
  Categoria.findOne({_id: req.body.id}).then((categoria) => {
  //O campo nome/slug vai receber o valor quem vem do formulario de edição.
    categoria.nome = req.body.nome 
    categoria.slug = req.body.slug

    categoria.save().then(() => {
      req.flash("success_msg", "Categoria editada com sucesso!")
      res.redirect("/admin/categorias")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria")
      res.redirect("/admin/categorias")
    })
  }).catch((err) => {
    req.flash("error_msg", "Hove um erro ao editar a categoria")
    res.redirect("/admin/categorias")
  })
})

//Rota de deletar categoria #43
router.post("/categorias/deletar", eAdmin, (req, res) => {
  console.log("Entrou na rota delete ")
  console.log(req.body.id)

  //Remove uma categoria com id igual ao id quem vem lá do formúlario. 
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    
    req.flash("success_msg", "Categoria deletada com sucesso!")
    res.redirect("/admin/categorias")
  }).catch((err) => {
 
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/admin/categorias")
  })
})

//Rota de postagens #45
router.get("/postagens", eAdmin, (req, res) => {
  //Função populate pega o nome da categoria de cada post
  Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
    res.render("admin/postagens", {postagens: postagens})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens")
    res.redirect("/admin")
  })
})
router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render("admin/addpostagem", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.render("/admin")
  })
})
//Salvando postagens no banco de dados #46
router.post("/postagens/nova", eAdmin, (req, res) => {
  //verifica se categoria que o usuário enviou tem o valor 0, ou seja não tem categoria registrada.
  var erros = []

  if(req.body.categoria == "0"){
    erros.push({texto: "Categoria inválida, registre uma categoria"})
  }
  if(erros.length > 0) {
    res.render("admin/addpostagem", {erros: erros})
  }else{
    // Essa const recebe os dados quem vem do formulário de postagens #46
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    //Salvamento da postagem
    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
      res.redirect("/admin/postagens")
    })
  }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
//Fazendo buscas em seguida no monogo #48
//Ele pesquisa primeiro por Postagem e depois por Categoria,
//e por fim rendenriza os  dados de {categorias:} e {postagem:} na view editpostagens
  Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin/postagens")
    })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("/admin/postagens")
  })
})
//Depoois fazer validação!!
//Rota que vai atualizar os dados das postagens
router.post("/postagem/edit", eAdmin, (req, res) => {
//(Postagem.findOne({_id: req.body.id}) ) Pesquisa por uma postagem que tenha um id...
//igual ao id do formulário editpostagens
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
      console.log("postagem 01")
      postagem.titulo = req.body.titulo
      postagem.slug = req.body.slug
      postagem.descricao = req.body.descricao
      postagem.conteudo = req.body.conteudo
      postagem.categoria = req.body.categoria
    
      postagem.save().then(() => {
        console.log("postagem 02")
        req.flash("success_msg", "Postagem editada com sucesso!")
        res.redirect("/admin/postagens")
      }).catch((err) => {
        console.log(err)
        console.log("postagem 03")
        req.flash("error_msg", "Erro interno")
        res.redirect("/admin/postagens")
      })
  }).catch((err) => {
    console.log(err)
    req.flash("error_msg", "Houve um erro ao salvar a edição")
    res.redirect("/admin/postagens")
  })
})

//Rota de deletar postagens. Deletando postagens #49
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.remove({_id: req.params.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/admin/postagens")
  })
})


console.log('Funcionando 10')
//Sempre exportar o router no final do aquivo.
module.exports = router

