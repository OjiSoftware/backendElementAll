import "dotenv/config";
import express from "express";

// Importar rutas
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes";
import brandRoutes from "./routes/brand.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import subCategoryRoutes from "./routes/subcategory.routes";
import saleRoutes from "./routes/sale.routes";

const app = express();

// Middleware
app.use(express.json());

// Ruta principal
app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/sales", saleRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
