import { Router } from "express";
import * as controller from "../controllers/brand.controller";

const router = Router();

router.get("/", controller.listBrands);
router.get("/:id", controller.getBrand);
router.post("/", controller.createBrand);
router.put("/:id", controller.updateBrand);
router.delete("/:id", controller.deleteBrand);

export default router;
