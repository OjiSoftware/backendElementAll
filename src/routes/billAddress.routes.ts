import { Router } from "express";
import * as controller from "../controllers/billAddress.controller";

const router = Router();

router.get("/", controller.getAllBillAddresses);
router.get("/:id", controller.getBillAddressById);
router.post("/", controller.createBillAddress);
router.put("/:id", controller.updateBillAddress);
router.delete("/:id", controller.deleteBillAddress);

export default router;