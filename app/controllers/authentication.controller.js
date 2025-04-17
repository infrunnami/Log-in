import path from 'path';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// login
function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ status: "Error", message: "Incomplete fields" });
    }

    const sql = `SELECT id, name, email, password FROM users WHERE email = ?`;

    db.get(sql, [email], (err, row) => {
        if (err) {
            console.error('Error in login, ', err.message);
            return res.status(500).send({ status: "Error", message: "Server Error" });
        }

        if (!row) {
            return res.status(401).send({ status: "Error", message: "Invalid email or password" });
        }

        // comparar las contraseñas
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error('Error comparing password, ', err.message);
                return res.status(500).send({ status: "Error", message: "Internal error" });
            }
            if (result) {
                req.session.usuario = {
                    id: row.id,
                    name: row.name,
                    email: row.email
                };
            
                console.log("Sesión creada:", req.session.usuario);
            
                return res.status(200).send({
                    status: "Success",
                    message: "Login successful"
                });

            } else {
                // contraseña incorrecta
                return res.status(401).send({
                    status: "Error",
                    message: "Invalid email or password."
                });
            }
        });
    });
}

// register
function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({ status: "Error", message: "Incomplete fields" });
    }

    const checkSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkSql, [email], (err, row) => {
        if (err) {
            console.error('Error verifying email, ', err.message);
            return res.status(500).send({ status: "Error", message: "Server Error" });
        }

        if (row) {
            return res.status(400).send({ status: "Error", message: "This email is already in use." });
        }

        // encriptar la contraseña
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error in hash, ', err.message);
                return res.status(500).send({ status: "Error", message: "Encryption error." });
            }

            const insertSql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
            db.run(insertSql, [name, email, hashedPassword], function (err) {
                if (err) {
                    console.error('Error registering, ', err.message);
                    return res.status(500).send({ status: "Error", message: "Error registering user" });
                }

                return res.status(201).send({
                    status: "Success",
                    message: "User successfully registered.",
                    userId: this.lastID
                });
            });
        });
    });
}

//recover
function recover(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ status: "Error", message: "Incomplete field" });
    }

    const sql = `SELECT id, name, email FROM users WHERE email = ?`;

    db.get(sql, [email], (err, row) => {
        if (err) {
            console.error('Error checking email: ', err.message);
            return res.status(500).send({ status: "Error", message: "Server error" });
        }

        if (!row) {
            return res.status(404).send({ status: "Error", message: "Email not found" });
        }

        //crear token
        const token = jwt.sign(
            { id: row.id, email: row.email },
            "ColoColo1234", 
            { expiresIn: "2h" }
        );
        
        console.log("Token generado:", token);
        
        const recoveryLink = `http://localhost:4000/reset-password?token=${token}`;
        console.log("Enlace de recuperación:", recoveryLink);



        return res.status(200).send({
            status: "Success",
            message: "Recovery link generated",
            recoveryLink,
            user: {
                id: row.id,
                name: row.name,
                email: row.email
            }
        });
    });
}

// reset password
function resetPassword(req, res) {
    console.log("Request body:", req.body);
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ 
            status: "Error",
            message: "Token or password missing"
        });
    }

    console.log("Token recibido:", token);


    // Verificar el token
    jwt.verify(token, "ColoColo1234", (err, decoded) => {
        if (err) {
            return res.status(400).json({ 
                status: "Error",
                message: "Invalid or expired token"
            });
        }
    
        const hashedPassword = bcrypt.hashSync(password, 10);
        const sql = `UPDATE users SET password = ? WHERE id = ?`;

        db.run(sql, [hashedPassword, decoded.id], function(err) {
            if (err) {
                return res.status(500).json({ 
                    status: "Error",
                    message: "Error updating password"
                });
            }

            return res.status(200).json({
                status: "Success",
                message: "Password successfully updated"
            });
        });
    });
}


export const methods = {
    login,
    register,
    recover,
    resetPassword
};
