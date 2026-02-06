import { Router } from "express";
import * as controller from "../controllers/client.controller";

const router = Router();

router.get("/", controller.getAllClients);
router.get("/:id", controller.getClient);
router.post("/", controller.createClient);
router.put("/:id", controller.updateClient);

export default router;
