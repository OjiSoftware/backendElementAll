import nodemailer from "nodemailer";

// Configuración universal basada en variables de entorno
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Ej: smtp.gmail.com o smtp.office365.com
    port: Number(process.env.EMAIL_PORT) || 587, // 587 es el estándar para TLS
    secure: process.env.EMAIL_SECURE === "true", // true para puerto 465, false para otros
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
    // Usamos el prefijo /auth/ para mantener la estructura que definimos en React
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Recuperación de Contraseña - ElementAll",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #1e40af;">¿Olvidaste tu contraseña?</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña en <strong>ElementAll</strong>.</p>
                <p>Haz clic en el siguiente botón para crear una nueva:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                      style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Restablecer Contraseña
                    </a>
                </div>
                <p style="font-size: 0.9em; color: #666;">
                    <em>Este enlace expirará en 15 minutos por tu seguridad. Si no solicitaste este cambio, puedes ignorar este correo.</em>
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #999; text-align: center;">© 2026 ElementAll ERP</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
