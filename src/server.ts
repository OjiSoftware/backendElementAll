import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API funcionando 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
