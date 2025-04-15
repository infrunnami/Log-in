import path from 'path';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
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
                // contraseña correcta
                return res.status(200).send({
                    status: "Success",
                    message: "Login successful",
                    user: {
                        id: row.id,
                        name: row.name,
                        email: row.email
                    }
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

export const methods = {
    login,
    register
};
