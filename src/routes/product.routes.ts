import { Router, Request, Response } from "express";

const router = Router();

// Endpoint GET /api/products
router.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Listando productos" });
});

// Endpoint POST /api/products
router.post("/", (req: Request, res: Response) => {
    console.log(req.body); // para ver qué envía Postman
    res.json({ message: "Producto creado", data: req.body });
});

export default router;
