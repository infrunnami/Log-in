import express from 'express';
import sqlite3 from 'sqlite3';




//fix para dirname
import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { methods as authentication} from './controllers/authentication.controller.js';



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

app.set('port',4000);
app.listen(app.get('port'));
console.log("server corriendo en ", app.get('port'))


//config
app.use(express.static(__dirname + "/public"));
app.use(express.json());

//rutas
app.get('/', (req, res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get('/admin', (req, res)=> res.sendFile(__dirname + "/pages/admin/admin.html"));
app.post('/api/login', authentication.login);
app.post('/api/register', authentication.register);


