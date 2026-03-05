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
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl}/auth/reset/${token}`;

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Recuperación de contraseña - ElementAll",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 28px; letter-spacing: -0.5px;">ElementAll</h1>
                    <p style="color: #6366f1; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 2px;">
                        Gestión Empresarial Integral
                    </p>
                </div>

                <h2 style="color: #111827; font-size: 22px; text-align: center; margin-top: 0;">¿Olvidaste tu contraseña?</h2>

                <p style="font-size: 16px; line-height: 1.5; color: #4b5563; text-align: center;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>ElementAll</strong>.
                </p>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}"
                      style="background-color: #4f46e5; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Restablecer contraseña
                    </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; text-align: center;">
                    Este enlace expirará en <strong>15 minutos</strong> por motivos de seguridad.<br>
                    Si no solicitaste este cambio, podés ignorar este correo tranquilamente.
                </p>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
                    <p style="font-size: 12px; color: #9ca3af;">
                        Si tenés problemas con el botón, copiá y pegá este enlace:<br>
                        <span style="color: #4f46e5;">${resetUrl}</span>
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                        © 2026 OjiSoftware • ElementAll ERP
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
