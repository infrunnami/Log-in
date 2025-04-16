import express from 'express';
import sqlite3 from 'sqlite3';
import session from 'express-session';




//fix para dirname
import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { methods as authentication} from './controllers/authentication.controller.js';
import { verificarAuth } from './middlewares/auth.middleware.js';



//base de datos
const db = new sqlite3.Database(path.join(__dirname, "/database.db"));

db.serialize(() =>{
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creando tabla:', err.message);
        } else {
            console.log('Tabla creada');
        }
    });
});


//server 
const app = express();
app.use(express.json());
app.set('port',4000);
app.listen(app.get('port'));

console.log("server corriendo en ", app.get('port'))


//autenticacion
app.use(session({
    secret: 'sherman1', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));


//config
app.use(express.static(__dirname + "/public"));
app.use(express.json());

//rutas
app.get('/', (req, res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get('/admin', verificarAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/admin/admin.html'));
});
app.get('/reset-password', (req, res) => {
    const token = req.query.token;  // Aquí se recibe el token como parámetro de query
    console.log("Token recibido en backend:", token);  // Verificación
    if (!token) {
        return res.redirect('/'); 
    }
    res.sendFile(path.join(__dirname, '/pages/reset-password.html'));  // Servir la página de reset
});


app.post('/api/login', authentication.login);
app.post('/api/register', authentication.register);
app.post('/api/recover', authentication.recover);
app.post('/api/reset-password', authentication.resetPassword);
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ status: "Error", message: "Error al cerrar sesión" });
        }
        res.status(200).send({ status: "Success", message: "Sesión cerrada exitosamente" });
    });
});


