// Importar el módulo sqlite3 para interactuar con la base de datos SQLite
const sqlite3 = require('sqlite3').verbose();

// Abrir una conexión con la base de datos
const db = new sqlite3.Database('mydatabase.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// Exportar la conexión para que pueda ser utilizada en otros archivos
module.exports = db;
