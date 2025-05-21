const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

//REGISTRO DE USUARIO

router.post('/registro', async(req, res) =>{
    const {nombre,correo,nombre_usuario,contraseña} = req.body;

    //validación basica
    if(!nombre || !correo || !nombre_usuario || !contraseña){
        return res.status(404).send('Faltan datos obligarios');
    }

    try{
        //Aqui se encripta la contraseña
        const hash = await bcrypt.hash(contraseña,10);
        const fecha = new Date();

        //Insertar en la base de datos
        const query= `INSERT INTO Usuarios (nombre,correo,nombre_usuario,contraseña)
        VALUES (?,?,?,?)`;

        //Consumir el query
        db.query(query,[nombre,correo,nombre_usuario,hash], (err, result) =>{
            if(err){
                console.log('Error al registrar',err);
                return res.status(400).send('Error al registrar');
            }
            res.status(200).send('Usuario registrado exitosamente');
        })   
    }catch(error){
            console.log('Error en el registro');
            res.status(500).send('error interno');
    }
    
})

module.exports = router;