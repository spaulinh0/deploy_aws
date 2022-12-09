//Esse arquivo serve para verificar se um usuário está altenticado ou se ele é admin. #60
module.exports = {
  eAdmin: function(req, res, next){
  //(isAuthenticated()): Função gerada pelo passport, serve para verificar se um certo usuário está autenticado ou não.
  //Se o campo (eAdmin) do usuário que estiver logado for == a 1 isso quer dizer que ele é Admin. 
    if(req.isAuthenticated() && req.user.eAdmin == 1){
        return next();
    }
    req.flash("error_msg", "Você precisa ser um Admin!")
    res.redirect("/")
  }
}
