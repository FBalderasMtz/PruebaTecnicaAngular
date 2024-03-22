const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Establecer la conexión a la base de datos SQLite y crear la tabla si no existe
const db = new sqlite3.Database('mydatabase.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        // Ejecutar la sentencia SQL para crear la tabla si no existe
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(250),
            contact VARCHAR(20),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(250),
            status VARCHAR(20),
            role VARCHAR(20)
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla', err.message);
            } else {
                console.log('Tabla creada exitosamente');
                // Insertar un usuario de ejemplo
                db.run(`INSERT INTO users (name, contact, email, password, status, role)
                        VALUES ('THE ACADEMY', '559003441', 'theacademy@gmailcom', 'admin123', 'true', 'admin')`, (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('Usuario de ejemplo insertado correctamente');
                    }
                });
            }
        });
    }
});

// Middleware para analizar datos de solicitudes entrantes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios de la base de datos' });
        }
        res.json(rows);
    });
});

// Ruta para agregar un nuevo usuario
app.post('/usuarios', (req, res) => {
    const { name, contact, email, password, status, role } = req.body;
    // Insertamos un nuevo usuario en la tabla users
    db.run('INSERT INTO users (name, contact, email, password, status, role) VALUES (?, ?, ?, ?, ?, ?)', 
    [name, contact, email, password, status, role], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al agregar usuario a la base de datos' });
        }
        // Enviamos la respuesta con el usuario recién creado
        res.json({ id: this.lastID, name, contact, email, password, status, role });
    });
});

const PORT = process.env.PORT || 3000; // Puerto donde se ejecutará el servidor
// Iniciamos el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
