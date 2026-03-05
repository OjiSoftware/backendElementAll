import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", controller.loginUser);
router.post("/logout", controller.logoutUser);
router.post("/recover-password", controller.recoverPassword);
router.post("/reset-password", controller.resetPassword);
router.get("/me", verifyToken, controller.getMe);
router.get("/verify-token/:token", controller.verifyResetToken);

export default router;
