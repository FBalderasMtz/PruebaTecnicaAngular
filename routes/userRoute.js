const express = require('express');
const connected = require('../connection.js');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Ruta para obtener todos los usuarios
router.get('/', (req, res) => {
    // Consulta SQL para obtener todos los usuarios de la base de datos
    connected.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            // Manejo de errores si ocurre algún problema al consultar la base de datos
            return res.status(500).json({ error: 'Error al obtener usuarios de la base de datos' });
        }
        // Envío de la respuesta con la lista de usuarios
        res.json(rows);
    });
});

// Ruta para obtener un usuario específico por su ID
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    // Consulta SQL para obtener un usuario por su ID
    connected.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            // Manejo de errores si ocurre algún problema al consultar la base de datos
            return res.status(500).json({ error: 'Error al obtener usuario de la base de datos' });
        }
        if (!row) {
            // Manejo de la situación en la que el usuario no se encuentra en la base de datos
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Envío de la respuesta con el usuario encontrado
        res.json(row);
    });
});

// Ruta para agregar un nuevo usuario
router.post('/', (req, res) => {
    const user = req.body; // Extraer el usuario del cuerpo de la solicitud
    const query = "INSERT INTO users (name, contact, email, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [user.name, user.contact, user.email, user.password, user.status, user.role];
    // Consulta SQL para agregar un nuevo usuario a la base de datos
    connected.run(query, values, function(err) {
        if (err) {
            // Manejo de errores si ocurre algún problema al insertar el usuario en la base de datos
            console.error(err);
            return res.status(500).json({ error: 'Error al agregar usuario a la base de datos' });
        }
        // Envío de la respuesta con el mensaje de éxito y el ID del usuario agregado
        res.json({ message: 'Usuario agregado exitosamente', userId: this.lastID });
    });
});

// Ruta para actualizar un usuario existente
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body; // Datos actualizados del usuario
    const query = "UPDATE users SET name = ?, contact = ?, email = ?, password = ?, status = ?, role = ? WHERE id = ?";
    const values = [updatedUser.name, updatedUser.contact, updatedUser.email, updatedUser.password, updatedUser.status, updatedUser.role, userId];
    // Consulta SQL para actualizar un usuario existente en la base de datos
    connected.run(query, values, (err) => {
        if (err) {
            // Manejo de errores si ocurre algún problema al actualizar el usuario en la base de datos
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar usuario en la base de datos' });
        }
        // Envío de la respuesta con el mensaje de éxito
        res.json({ message: `Usuario con ID ${userId} actualizado exitosamente` });
    });
});

// Ruta para eliminar un usuario existente
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    const query = "DELETE FROM users WHERE id = ?";
    // Consulta SQL para eliminar un usuario existente de la base de datos
    connected.run(query, [userId], (err) => {
        if (err) {
            // Manejo de errores si ocurre algún problema al eliminar el usuario de la base de datos
            console.error(err);
            return res.status(500).json({ error: 'Error al eliminar usuario de la base de datos' });
        }
        // Envío de la respuesta con el mensaje de éxito
        res.json({ message: `Usuario con ID ${userId} eliminado exitosamente` });
    });
});

// Ruta para iniciar sesión de usuario
router.post('/login', (req, res) => {
    const user = req.body;
    const query = "SELECT email, password, role, status FROM users WHERE email = ?";
    // Consulta SQL para obtener el usuario por su correo electrónico
    connected.get(query, [user.email], (err, result) => {
        if (err) {
            // Manejo de errores si ocurre algún problema al consultar la base de datos
            console.error(err);
            return res.status(500).json({ error: 'Error al iniciar sesión' });
        }
        // Verificación de las credenciales del usuario y generación del token JWT
        if (!result || result.password !== user.password) {
            // Manejo de la situación en la que las credenciales no son válidas
            return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
        }
        if (result.status === 'false') {
            // Manejo de la situación en la que el usuario está pendiente de aprobación
            return res.status(401).json({ message: 'Espera la aprobación del administrador...' });
        }
        const payload = { email: result.email, role: result.role };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
        // Envío de la respuesta con el token JWT generado
        res.status(200).json({ token: accessToken });
    });
});

// Creación de un transporter para enviar correos electrónicos
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotpassword', (req, res) => {
    const { email } = req.body;
    const query = "SELECT email FROM users WHERE email = ?";
    connected.get(query, [email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al buscar el correo electrónico en la base de datos' });
        }
        if (!result) {
            return res.status(404).json({ message: 'Correo electrónico no encontrado' });
        }

        // Generar nueva contraseña aleatoria
        const newPassword = generateRandomPassword(); // Implementa esta función para generar una contraseña aleatoria segura

        // Actualizar la contraseña en la base de datos
        const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        connected.run(updateQuery, [newPassword, email], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al actualizar la contraseña en la base de datos' });
            }

            // Enviar correo electrónico con la nueva contraseña
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Recuperación de Contraseña - THE ACADEMY DVR',
                text: `Tu nueva contraseña es: ${newPassword}`,
            };
            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al enviar el correo electrónico' });
                }
                res.json({ message: 'Se ha enviado una nueva contraseña a tu correo electrónico' });
            });
        });
    });
});



// Exportación del router para ser utilizado en la aplicación principal
module.exports = router;
