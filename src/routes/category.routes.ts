import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/catalog", categoryController.getCategoriesWithSub)
router.get("/:id", categoryController.getCategory);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.disableCategory);

export default router;
