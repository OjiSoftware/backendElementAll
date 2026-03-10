import {Router} from "express";
import * as saleDetailController from "../controllers/saleDetails.controller";

const router = Router();

router.get("/", saleDetailController.getAllSaleDetails);
router.get("/:id", saleDetailController.getSaleDetailById);
router.post("/", saleDetailController.createSaleDetail);
router.put("/:id", saleDetailController.updateSaleDetail);
router.delete("/:id", saleDetailController.deleteSaleDetail);

export default router;