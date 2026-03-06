const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
let cart = [];

app.get("/", (req, res) => {
    res.send("imblasco cart backend activo");
});

app.get("/test", (req, res) => {
    res.json({
        status: "ok",
        message: "conexion carrito funcionando"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor carrito iniciado en puerto " + PORT);
});
