// src/services/email.service.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail", // Si usas Outlook u otro, cambia el servicio o usa host/port SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
    // La URL de tu frontend que tiene la pantalla de "Crear nueva contraseña"
    // (Por defecto en tu frontend vi que lee el token de la URL: ?token=...)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Recuperación de Contraseña - ElementAll",
        html: `
            <h2>¿Olvidaste tu contraseña?</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
            <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            <p><em>Este enlace expirará en 15 minutos. Si no solicitaste este cambio, ignora este correo.</em></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};
