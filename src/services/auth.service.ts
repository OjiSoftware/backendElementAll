// src/services/auth.service.ts
import * as userRepo from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./email.service";

export const login = async (email: string, password: string) => {
    // 1. Buscar usuario
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
        throw new Error("Credenciales incorrectas");
    }

    // 2. Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Credenciales incorrectas");
    }

    // 3. Generar JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET no está configurado en el servidor");
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
        expiresIn: "1d",
    });

    // 4. LIMPIEZA TOTAL: Solo devolvemos lo que el cliente necesita
    const {
        password: _,
        resetToken: __,
        resetTokenExpires: ___,
        ...safeUser
    } = user;

    return { token, user: safeUser };
};

export const recoverPassword = async (email: string) => {
    const user = await userRepo.findUserByEmail(email);

    // Por seguridad, aunque el usuario no exista, respondemos que "se envió el correo"
    // para no revelar qué emails están registrados en el sistema.
    if (!user) return;

    // Generar un token aleatorio seguro de 32 bytes (64 caracteres en hex)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Fecha de expiración (15 minutos a partir de ahora)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    // Guardar token en la BD
    await userRepo.saveResetToken(user.id, resetToken, expiresAt);

    // Enviar el email
    await sendPasswordResetEmail(user.email, resetToken);
};

export const resetPassword = async (token: string, newPassword: string) => {
    // 1. Validación de integridad (Espejo del frontend)
    // Limpiamos espacios y verificamos longitud mínima
    const cleanPassword = newPassword.trim();
    if (cleanPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    // 2. Buscar al usuario por el token
    const user = await userRepo.findUserByResetToken(token);

    if (!user) {
        throw new Error("Token inválido o expirado");
    }

    // 3. Verificar que el token no haya expirado
    // (Aseguramos que la comparación de fechas sea precisa)
    if (
        !user.resetTokenExpires ||
        new Date(user.resetTokenExpires) < new Date()
    ) {
        throw new Error(
            "El enlace de recuperación ha expirado. Solicita uno nuevo.",
        );
    }

    // 4. Hashear la nueva contraseña (usamos la limpia)
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // 5. Actualizar la base de datos (borrando el token)
    await userRepo.updatePasswordAndClearToken(user.id, hashedPassword);
};

export const register = async (userData: any) => {
    const { name, email, password } = userData;

    // 1. Verificar si el email ya existe
    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
        throw new Error("El correo electrónico ya está registrado.");
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario en la BD (Asegurate de tener createUser en userRepo)
    const newUser = await userRepo.createUser({
        name,
        email,
        password: hashedPassword,
    });

    // 4. Limpiamos datos sensibles antes de devolver al controller
    const {
        password: _,
        resetToken: __,
        resetTokenExpires: ___,
        ...safeUser
    } = newUser;

    return safeUser;
};
