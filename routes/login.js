const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

//LOGIN DE USUARIO
router.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;

  //VALIDACIÓN BASICA
  if (!correo || !contraseña) {
    return res.status(400).send("Todos estos campos son requeridos");
  }

  //BUSCAR EL USUARIO EN LA BASE DE DATOS
  db.query(
    "SELECT * FROM Usuarios WHERE correo = ?",
    [correo],
    async (err, results) => {
      if (err) {
        console.log("Error en la consulta", err);
        return res.status(500).send("Error interno del servidor");
      }

      if (results.length === 0) {
        return res.status(404).send("Usuario no existe");
      }

      const usuario = results[0];

      try {
        //COMPARAR SI LAS CONTRASEÑAS SON IGUALES
        const match = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!match) {
          return res.status(401).send("Contraseña incorrecta");
        }

        // Login exitoso
        return res.status(200).json({
          mensaje: "Login exitoso",
          nombre: usuario.nombre,
          usuario: {
            usuario_id: usuario.usuario_id,
            correo: usuario.correo,
            nombre: usuario.nombre,
            nombre_usuario: usuario.nombre_usuario,
          },
        });
      } catch (bcryptError) {
        console.log("Error al comparar contraseñas", bcryptError);
        return res.status(500).send("Error interno del servidor");
      }
    }
  );
});

module.exports = router;
