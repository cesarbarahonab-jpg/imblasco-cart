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

/* AGREGAR PRODUCTO AL CARRITO */
app.post("/add-to-cart", (req, res) => {

    const { product_id, quantity } = req.body;

    cart.push({
        product_id,
        quantity
    });

    res.json({
        status: "ok",
        cart
    });

});

/* VER CARRITO */
app.get("/cart", (req, res) => {
    res.json(cart);
});

app.get("/clear-cart", (req, res) => {
    cart = [];
    res.json({
        status:"ok",
        message:"carrito vaciado"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor carrito iniciado en puerto " + PORT);
});
