const nodemailer = require("nodemailer");
require('dotenv').config(); // Cargar variables de entorno

//CREAR EL TRANSPORTE SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendResetPassword = async (to, resetUrl) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: 'Restablecimiento de contraseña',
            html: `<b>¿Solicitaste el restablecimiento de tu contraseña?</b>
            <p>Haz click en el siguiente enlace para restablecer tu contraseña</p>
            <a href="${resetUrl}" target="_blank">Restablecer contraseña</a>
            <p>Este enlace expira en 1h</p>
            <p>Si no fuiste tú, ignóralo</p>
            `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente", info.messageId);
        return true;
    } catch (err) {
        console.error("Error al enviar correo", err);
        return false;
    }
};

module.exports = {
    transporter,
    sendResetPassword
}
