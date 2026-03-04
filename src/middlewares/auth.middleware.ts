// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extendemos la interfaz Request de Express para inyectar el usuario
export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        // Obtenemos el token desde las cookies
        const token = req.cookies.token;

        if (!token) {
            return res
                .status(403)
                .json({
                    error: "No se proporcionó un token de autorización. Acceso denegado.",
                });
        }

        const secret = process.env.JWT_SECRET as string;

        // Verificamos el token
        const decoded = jwt.verify(token, secret);

        // Guardamos los datos del usuario en la request para usarlos en el controlador
        req.user = decoded;

        next(); // Continuamos a la siguiente función (el controlador)
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};
