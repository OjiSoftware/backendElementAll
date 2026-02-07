import { Router } from "express";
import * as saleController from "../controllers/sale.controller";

const router = Router();

router.get("/", saleController.getSales);
router.get("/:id", saleController.getSale);
router.post("/", saleController.createSale);
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale);

export default router;