import "dotenv/config";
import express from "express";
import productRoutes from "./routes/product.routes"; // importamos el router
import clientRoutes from "./routes/client.routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

// registramos el router en /api/products
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
