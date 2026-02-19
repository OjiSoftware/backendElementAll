import "dotenv/config";
import express from "express";
import cors from 'cors';

// Importar rutas
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes";
import brandRoutes from "./routes/brand.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import subCategoryRoutes from "./routes/subcategory.routes";
import saleRoutes from "./routes/sale.routes";
import saleDetailRoutes from "./routes/saleDetail.routes";
import billAddressRoutes from "./routes/billAddress.routes";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Ruta principal
app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/salesDetails", saleDetailRoutes);
app.use("/api/billAddresses", billAddressRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
