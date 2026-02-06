import "dotenv/config";
import express from "express";
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes"

const app = express();
app.use(express.json());



app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

app.use("/api/users", userRoutes)
app.use("/api/clients", clientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
