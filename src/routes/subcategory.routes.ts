// src/routes/subcategory.routes.ts
import { Router } from "express";
import * as subCategoryController from "../controllers/subcategory.controller";

const router = Router();

router.get("/", subCategoryController.getSubCategories);
router.get("/:id", subCategoryController.getSubCategory);
router.post("/", subCategoryController.createSubCategory);
router.put("/:id", subCategoryController.updateSubCategory);
router.delete("/:id", subCategoryController.disableSubCategory);

export default router;
