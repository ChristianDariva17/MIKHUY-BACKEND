const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetPassword } = require("../config/email");
require("dotenv").config();

// OLVIDE CONTRASEÑA
router.post("/forgot-password", async (req, res) => {
  console.log("Recibida petición forgot-password");
  console.log("Body recibido:", req.body);

  const { correo } = req.body;

  if (!correo) {
    console.log("No se proporcionó correo");
    return res.status(400).send("El correo es obligatorio");
  }

  console.log("Buscando usuario con correo:", correo);

  try {
    db.query(
      "SELECT * FROM Usuarios WHERE correo = ?",
      [correo],
      async (err, results) => {
        if (err) {
          console.log("Error en la consulta:", err);
          return res.status(500).send("Error interno");
        }

        console.log("Resultados encontrados:", results.length);

        if (results.length === 0) {
          console.log("Usuario no encontrado");
          return res.status(200).send("Si el correo existe recibirás una URL");
        }

        const usuario = results[0];
        console.log("Usuario encontrado:", usuario.nombre);

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1h validez

        console.log("Token generado:", resetToken);
        console.log("Expira en:", new Date(resetTokenExpiry));

        db.query(
          "UPDATE Usuarios SET resetToken = ?, resetTokenExpiry = ? WHERE usuario_id = ?",
          [resetToken, resetTokenExpiry, usuario.usuario_id],
          async (updateErr) => {
            if (updateErr) {
              console.error("Error al actualizar BD:", updateErr);
              return res.status(500).send("Error interno");
            }

            console.log("Token guardado en BD");

            const frontendUrl = process.env.FRONTEND || "http://localhost:5500";
            const resetUrl = `${frontendUrl}/RESET.html?token=${resetToken}`;

            console.log("URL de reset:", resetUrl);
            console.log("Intentando enviar email a:", correo);

            try {
              const emailResult = await sendResetPassword(correo, resetUrl);
              console.log("Email enviado exitosamente");
              res.status(200).send("Si el correo existe recibirás un link");
            } catch (mailError) {
              console.error("Error al enviar email:", mailError);
              return res
                .status(500)
                .send("Error al enviar el correo de restablecimiento");
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Error interno");
  }
});

// RESET PASSWORD 
router.post("/reset-password", async (req, res) => {
  console.log("Recibida petición reset-password");
  console.log("Body recibido:", req.body);

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send("Token y nueva contraseña son obligatorios");
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .send("La contraseña debe tener al menos 6 caracteres");
  }

  try {
    db.query(
      "SELECT * FROM Usuarios WHERE resetToken = ? AND resetTokenExpiry > ?",
      [token, Date.now()],
      async (err, results) => {
        if (err) {
          console.error("Error en la consulta:", err);
          return res.status(500).send("Error interno del servidor");
        }

        console.log("Usuarios encontrados con token:", results.length);

        if (results.length === 0) {
          console.log("Token inválido o expirado");
          return res.status(400).send("Token inválido o expirado");
        }

        const usuario = results[0];
        console.log("Usuario para reset encontrado:", usuario.nombre);

        try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

          db.query(
            "UPDATE Usuarios SET contraseña = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE usuario_id = ?",
            [hashedPassword, usuario.usuario_id],
            (updateErr) => {
              if (updateErr) {
                console.error(" Error al actualizar contraseña:", updateErr);
                return res.status(500).send("Error interno del servidor");
              }

              console.log("Contraseña actualizada correctamente");
              res.status(200).send("Contraseña restablecida exitosamente");
            }
          );
        } catch (hashError) {
          console.error("Error al hashear contraseña:", hashError);
          return res.status(500).send("Error interno del servidor");
        }
      }
    );
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
