// src/routes/client.routes.ts
import { Router } from "express";
import * as clientController from "../controllers/client.controller";

const router = Router();

router.get("/", clientController.getClients);
router.get("/:id", clientController.getClient);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

export default router;
