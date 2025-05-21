const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto')
const {sendResetPassword} = require ('../config/email');
const { console } = require('inspector');
const { route } = require('./auth');
require('dotenv').config();

router.post('/olvide-contraseña', async(req, res) => {
    const { correo } = req.body;

    if(!correo){
        return res.status(400).send("El correo es obligatorio");
    }

    try{
        db.query('Select * from Usuarios where correo = ?', [correo],
            async(err, results)=>{
                if(err){
                    console.log('Error en la consulta');
                    return res.status(500).send('Error interno');
                }
                if(results.length == 0){
                    return res.status(200).send("Si el correo existe recibiras una url");
                }
                const usuario = results[0];

                const resetToken = crypto.randomBytes(20).toString('hex');
                const resetTokenExpiry = Date.now() + 3600000; // 1h validez

                db.query(
                    'UPDATE Usuarios set reset_Token=?, reset_Token_expiry=? WHERE usuario_id = ?',
                    [resetToken, resetTokenExpiry, usuario.usuario_id],
                    async(updateErr)=>{
                        if(updateErr){
                            console.error('Error al realiza la actualización', updateErr);
                            return res.status(500).send('Error interno');
                        }
                        const frontedUrl = process.env.FRONTED || 'http://localhost:5500/';
                        const resetUrl = `${frontedUrl}/reset.html?token=${resetToken}`;
                        try{
                            await sendResetPassword(correo, resetUrl);
                            res.status(200).send('Si el correo existe recibiras un link');
                        }catch(mailError){
                            console.error('Error al enviar el correo', mailError);
                            return res.status(500).send('Error al enviar el correo de restablecimiento')
                        }
                    }
                )
            }
        )
    }catch(error) {
        console.error('Error en olvide contraseña');
        res.status(500).send('Error interno');
    }
});

module.exports = router;

