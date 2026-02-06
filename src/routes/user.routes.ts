import { Router } from "express";
import * as controller from "../controllers/user.controller";

const router = Router();

router.get("/:id", controller.getUser);
router.get("/", controller.listUsers);
router.post("/", controller.createUser);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);


export default router;