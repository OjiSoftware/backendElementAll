import "dotenv/config";
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

// Importar rutas
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes";
import brandRoutes from "./routes/brand.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import subCategoryRoutes from "./routes/subcategory.routes";
import saleRoutes from "./routes/sale.routes";
import saleDetailRoutes from "./routes/saleDetail.routes";
import billAddressRoutes from "./routes/billAddress.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Ruta principal
app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/salesDetails", saleDetailRoutes);
app.use("/api/billAddresses", billAddressRoutes);
app.use("/api/payments", paymentRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
