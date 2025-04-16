export function verificarAuth(req, res, next) {
    console.log("Sesión activa:", req.session.usuario);
    if (req.session && req.session.usuario) {
        next();
    } else {
        res.redirect('/');
    }
}