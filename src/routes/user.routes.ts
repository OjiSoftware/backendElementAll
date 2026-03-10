// src/routes/user.routes.ts
import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Puedes dejar la creación de usuario pública (para que la gente se registre)
router.post("/", controller.createUser);

// Y proteger el resto de operaciones (solo usuarios logueados pueden hacer esto)
router.get("/", verifyToken, controller.listUsers);
router.get("/:id", verifyToken, controller.getUser);
router.put("/:id", verifyToken, controller.updateUser);
router.delete("/:id", verifyToken, controller.deleteUser);

export default router;
