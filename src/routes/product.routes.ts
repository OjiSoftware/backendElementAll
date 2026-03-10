import { Router } from "express";
import * as productController from "../controllers/product.controller";

const router = Router();

router.get("/", productController.getProducts);
router.get("/catalog", productController.getCatalog)
router.get("/:id", productController.getProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.disableProduct);

export default router;
