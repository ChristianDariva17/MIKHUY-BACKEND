const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para agregar restaurante
router.post('/agregar', (req, res) => {
    const {
        nombre,
        direccion,
        telefono,
        precios,
        tipo_comida,
        rango_precio,
        imagen, // Aquí deberías manejar la subida de archivos con multer si quieres guardar imágenes
        caracteristica_uno,
        caracteristica_dos,
        caracteristica_tres
    } = req.body;

    if (!nombre || !direccion ||!telefono || !precios || !tipo_comida || !rango_precio || !caracteristica_uno || !caracteristica_dos || !caracteristica_tres) {
        return res.status(400).send('Faltan datos obligatorios');
    }

    const query = `
        INSERT INTO Restaurante 
        (nombre, direccion, telefono, precios, tipo_comida, rango_precio, imagen, caracteristica_uno, caracteristica_dos, caracteristica_tres)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        nombre,
        direccion,
        telefono,
        precios,
        tipo_comida,
        rango_precio,
        imagen,
        caracteristica_uno,
        caracteristica_dos,
        caracteristica_tres
    ], (err, result) => {
        if (err) {
            console.log('Error al agregar restaurante', err);
            return res.status(500).send('Error al agregar restaurante');
        }
        res.status(200).send('Restaurante registrado exitosamente');
    });
});

module.exports = router;