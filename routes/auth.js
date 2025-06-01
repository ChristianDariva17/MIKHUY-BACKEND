const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { default: firebase } = require('firebase/compat/app');

//REGISTRO DE USUARIO

router.post('/registro', async (req, res) => {
    const { nombre, correo, nombre_usuario, contraseña } = req.body;

    //validación basica
    if (!nombre || !correo || !nombre_usuario || !contraseña) {
        return res.status(404).send('Faltan datos obligarios');
    }

    try {
        //Aqui se encripta la contraseña
        const hash = await bcrypt.hash(contraseña, 10);
        const fecha = new Date();

        //Insertar en la base de datos
        const query = `INSERT INTO Usuarios (nombre,correo,nombre_usuario,contraseña)
        VALUES (?,?,?,?)`;

        //Consumir el query
        db.query(query, [nombre, correo, nombre_usuario, hash], (err, result) => {
            if (err) {
                console.log('Error al registrar', err);
                return res.status(400).send('Error al registrar');
            }
            res.status(200).send('Usuario registrado exitosamente');
        })
    } catch (error) {
        console.log('Error en el registro');
        res.status(500).send('error interno');
    }

})

//registro con google
router.post('/registro-google', async (req, res) => {
    const { nombre_usuario, correo } = req.body;

    //validación basica
    if (!nombre_usuario || !correo) {
        return res.status(404).send('Faltan datos obligarios');
    }

    const uid = `test_uid_${Date.now()}`; // Generar un UID único para el usuario

    db.query(
        "INSERT INTO Usuarios (firebase_uid, nombre_usuario, correo, auth_provider, email_verified, fecha_registro ) VALUES (?, ?, ?, ?)",
        [uid, nombre_usuario, correo, "google", true, new Date()],
        (err, result) => {
            if (err) {
                console.error('Error al crear usuario de test', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Usuario creado con éxito', result.insertId);
            res.json({
                success: true,
                message: 'Usuario de google creado con éxito',
                user: {
                    id: user.insertId,
                    firebase_uid: uid,
                    nombre_usuario: nombre_usuario,
                    correo: correo,
                    auth_provider: 'google'
                }


            });


        });


})


router.post('/login/google', async (req, res) => {

    const { nombre_usuario, correo, firebase_uid, email_verified } = req.body;



    if (!correo || !firebase_uid) {

        return res.status(400).send('Faltan datos obligatorios');

    }



    db.query('SELECT * FROM Usuarios WHERE correo = ?', [correo], (err, results) => {

        if (err) {

            console.error('Error en consulta:', err);

            return res.status(500).send('Error en el servidor');

        }



        if (results.length === 0) {

            // Usuario no existe, lo registramos

            const insertQuery = `

    INSERT INTO Usuarios (correo, nombre_usuario, auth_provider, firebase_uid, email_verified)

    VALUES (?, ?, 'google', ?, ?)

   `;

            db.query(insertQuery, [correo, nombre_usuario, firebase_uid, email_verified ? 1 : 0], (err, result) => {

                if (err) {

                    console.error('Error al insertar usuario Google:', err);

                    return res.status(500).send('Error al registrar usuario');

                }



                return res.status(201).json({

                    mensaje: 'Usuario registrado con Google',

                    usuario: {

                        id: result.insertId,

                        nombre_usuario,

                        correo,

                        auth_provider: 'google'

                    }

                });

            });

        } else {

            // Usuario ya existe

            return res.status(200).json({

                mensaje: 'Login con Google exitoso',

                usuario: results[0]

            });

        }

    });

});

module.exports = router;