// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as userRepo from "../repositories/user.repository";
import { AuthRequest } from "../middlewares/auth.middleware";

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email y contraseña son obligatorios" });
        }

        const result = await authService.login(email, password);

        // Configurar la cookie HTTP-Only
        res.cookie("token", result.token, {
            httpOnly: true, // El frontend no puede leerla con JavaScript
            secure: process.env.NODE_ENV === "production", // true si usas HTTPS (producción)
            sameSite: "strict", // Protege contra ataques CSRF
            maxAge: 1000 * 60 * 60 * 24, // 1 día en milisegundos
        });

        res.status(200).json({
            message: "Login exitoso",
            user: result.user,
        });
    } catch (e: any) {
        res.status(401).json({ error: e.message });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    // Para cerrar sesión, simplemente limpiamos la cookie
    res.clearCookie("token");
    res.status(200).json({ message: "Sesión cerrada con éxito" });
};

export const recoverPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "El email es obligatorio" });
        }

        // Llamamos al servicio (no esperamos el retorno, devolvemos success de inmediato)
        await authService.recoverPassword(email);

        res.status(200).json({
            message: "Si el correo existe, se enviarán las instrucciones.",
        });
    } catch (e: any) {
        // En un entorno real, registra el error en consola, pero no se lo digas al usuario
        console.error("Error en recoverPassword:", e);
        res.status(500).json({
            error: "Ocurrió un error al procesar la solicitud.",
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        // En tu frontend envías: body: JSON.stringify({ newPassword: password1, token: token })
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                error: "El token y la nueva contraseña son obligatorios.",
            });
        }

        await authService.resetPassword(token, newPassword);

        res.status(200).json({ message: "Contraseña actualizada con éxito." });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        // req.user viene del middleware verifyToken (tiene el id y el email)
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "No autenticado" });
        }

        // Buscamos los datos frescos del usuario en la base de datos
        const user = await userRepo.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const {
            password: _,
            resetToken: __,
            resetTokenExpires: ___,
            ...safeUser
        } = user;

        res.status(200).json(safeUser);
    } catch (e: any) {
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
};

export const verifyResetToken = async (req: Request, res: Response) => {
    const token = req.params.token as string;

    try {
        const user = await userRepo.findUserByResetToken(token);

        if (!user) {
            return res.status(400).json({
                error: "El enlace es inválido o ya ha expirado.",
            });
        }

        return res.status(200).json({ message: "Token válido" });
    } catch (error) {
        console.error("Error en verifyResetToken:", error);
        res.status(500).json({ error: "Error al verificar el token" });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({
                    error: "Nombre, email y contraseña son obligatorios.",
                });
        }

        const newUser = await authService.register({ name, email, password });

        res.status(201).json({
            message: "Usuario creado con éxito",
            user: newUser,
        });
    } catch (e: any) {
        // Si el error es de "correo ya registrado", devolvemos un 400 (Bad Request)
        const status =
            e.message === "El correo electrónico ya está registrado."
                ? 400
                : 500;
        res.status(status).json({ error: e.message });
    }
};
