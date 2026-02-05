import { Router } from "express";
import * as controller from "../controllers/client.controller";

const router = Router();

router.get("/:id", controller.getClient);
router.post("/", controller.createClient);
router.put("/:id", controller.updateClient);
router.get("/", controller.getAllClients);

export default router;
