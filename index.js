const express = require('express');
const connected = require('./connection');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', (req, res) => {
    // Lógica para obtener todos los usuarios
    res.send('Obtener todos los usuarios');
});

// Ruta para obtener un usuario específico por su ID
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    // Lógica para obtener un usuario por su ID
    res.send(`Obtener usuario con ID ${userId}`);
});

// Ruta para agregar un nuevo usuario
router.post('/', (req, res) => {
    const user = req.body; // Extraer el usuario del cuerpo de la solicitud
    const query = "INSERT INTO users (name, contact, email, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [user.name, user.contact, user.email, user.password, user.status, user.role];
    connected.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al agregar usuario a la base de datos' });
        }
        res.json({ message: 'Usuario agregado exitosamente', userId: results.insertId });
    });
});

// Ruta para actualizar un usuario existente
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body; // Datos actualizados del usuario
    const query = "UPDATE users SET name = ?, contact = ?, email = ?, password = ?, status = ?, role = ? WHERE id = ?";
    const values = [updatedUser.name, updatedUser.contact, updatedUser.email, updatedUser.password, updatedUser.status, updatedUser.role, userId];
    connected.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar usuario en la base de datos' });
        }
        res.json({ message: `Usuario con ID ${userId} actualizado exitosamente` });
    });
});

// Ruta para eliminar un usuario existente
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    const query = "DELETE FROM users WHERE id = ?";
    connected.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al eliminar usuario de la base de datos' });
        }
        res.json({ message: `Usuario con ID ${userId} eliminado exitosamente` });
    });
});

module.exports = router;
