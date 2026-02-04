import "dotenv/config";
import express from "express";
import productRoutes from "./routes/productRoutes"; // importamos el router

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

// registramos el router en /api/products
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
