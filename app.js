//Iniciando projeto Express.js #31
// Carrengando módulos
  const express = require('express')
  console.log("FUNCIONADO-1 ")
  const handlebars = require('express-handlebars')
  console.log("FUNCIONADO-2 ") 
  const bodyParser = require("body-parser")
  console.log("FUNCIONADO-3 ")
  //recebe a função que vem do express 
  const app = express()
  console.log("FUNCIONADO-4 ")
  //Pegando o arquivo admin que está dentro da pasta routes.
  const admin = require("./routes/admin")
  //Módulo padrão do Node que serve para manipular pastas. #33
  const path = require("path")
  console.log("FUNCIONADO-5 ")
  const mongoose = require("mongoose")
  const session = require("express-session")
  //Flash é o tipo de sessão que só aparece uma vez, quando uma pgína e recarregada a mensagem some.
  const flash = require("connect-flash")
  //Carregando model de postagens #50
  require("./models/Postagem")
  //Declarando model de postagem #50
  const Postagem = mongoose.model("postagens")
  //Carregando model de categoria #52
  require("./models/Categoria")
  const Categoria = mongoose.model("categorias")
  //Importando rota de usuario #54
  const usuarios = require("./routes/usuario")
  //Carregando o passport #58
  const passport = require("passport")
  //Chamando o arquivo (auth) e passando o passport para ele. #58
  require("./config/auth")(passport)

// Configurações 
  // Sessão  #39
  //Configurando Sessão
  //(app.use) serve para configurar e criar Middlewares.
    app.use(session({
      //Atributo (secret) É tipo um chave para gerar uma sessão.
      secret: "cursodenode",
      resave: true,
      saveUninitialized: true
    }))

    //OBS: Ordem de configuração importante --> 1-Confg. a (Sessão); 2-Config. o (passport); 3-Config. o app.use(flash())
    //Configurando o Passport #58
    app.use(passport.initialize())
    app.use(passport.session())
    

    //Configurando o flash, Obs: deve ficar sempre abaixo da sessão.
    app.use(flash())

  // Middleware
    app.use((req, res, next) => {
      //(res.locals): Declara uma variavel global, depois de res.locals vem nome da variavel.
      //Guarda a menssagem de sucesso.
      res.locals.success_msg = req.flash("success_msg")
      //Guarda a menssagem de erro.
      res.locals.error_msg = req.flash("error_msg")
      //Declarando variável global de erro para mostrar as menssagens de erro na tela de Login. #59
      res.locals.error = req.flash("error")
      //Essa variável (user) vai armazenar os dados do usuário autenticado.
      //(req.user): É criado pelo passport automaticamente, que armazena dados do usuário logado #60
      //E caso não existir usuário logado o que vai ser passsado para a variável é o valor (null).
      res.locals.user = req.user || null;
      //(next): Manda passar a requisição, para que o site não fique só carregando.
      next()
    })

  // Bory Parser 
      app.use(express.urlencoded({extended: true}))
      console.log("FUNCIONADO-6 ")
      app.use(express.json())
      console.log("FUNCIONADO-7 ")

  //  Handlebars
      app.engine('handlebars', handlebars.engine ({defaultLayout: 'main' }))
      console.log("FUNCIONADO-8 ")
      app.set('view engine', 'handlebars')
      console.log("FUNCIONADO-9 ")

  //  Mongoose
    //Configurando o mongoose.
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
      console.log("Conectando ao mongo")
    }).catch((err) => {
      console.log("Erro ao se conectar: "+err)
    })

  //Public 
  // Fala pro express que a pasta que tá guardando todos os arquivos estáticos é pasta (public). #33
  // (path.join(__dirname): Pega o diretótio absoluto para a pasta (public), e evita muitos erros
  app.use(express.static(path.join(__dirname, "public")))

// Rotas 
  app.get('/', (req, res) => {
    //Criando home page #50
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
    res.render("index", {postagens: postagens})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/404")
    })
  })

  // Página de postagem #51
  app.get("/postagem/:slug", (req, res) => {
   
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
    
      if(postagem){
          res.render("postagem/index", {postagem: postagem})
      }else{
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect("/")
      }
  }).catch((err) => {
    console.log(err)
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/")
  })
})

  //Listagem de categorias #52
  app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
      res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/")
    })
  })
  app.get("/categorias/:slug", (req, res) => {
    console.log("CONSOLE 01")
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
      console.log("CONSOLE 02")
        if(categoria){
          //Pesquisar os posts que pertemcem as categorias passadas pelo slug
          Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
            res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
          
          }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro ao listar os posts!")
            res.redirect("/")
          })
          console.log("CONSOLE 03")

        }else{
          console.log("CONSOLE 04")
          req.flash("error_msg", "Esta categoria não existe")
          res.redirect("/")
        }
      }).catch((err) => {
        console.log("CONSOLE 05")
        console.log(err)
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
        res.redirect("/")
      })
  })

  app.get("/404", (req, res) => {
    res.send('Erro 404!')
  })

  //Quando se cria um grupo de rotas separado esses grupos vão ter um prefixo. Ex:(/admin)
  app.use('/admin', admin)
  app.use("/usuarios", usuarios)
  console.log("FUNCIONADO-10 ")

//Outros 
//(process.env.PORT) Fazendo Deploy na Heroku. #62 
const PORT = process.env.PORT || 8089
console.log("FUNCIONADO-11 ")
app.listen(PORT, () => {
  console.log("Servidor rodando! ")
})
console.log("FUNCIONADO-12 ")