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

    const existing = cart.find(p => p.product_id === product_id);

    if(existing){
        existing.quantity += quantity;
    }else{
        cart.push({ product_id, quantity });
    }

    res.json({
        status: "ok",
        cart
    });

});

/* VER CARRITO */
app.get("/cart", (req, res) => {
    res.json(cart);
});

/* ELIMINAR PRODUCTO DEL CARRITO */
app.post("/remove-from-cart", (req, res) => {

    const { product_id } = req.body;

    cart = cart.filter(p => p.product_id !== product_id);

    res.json({
        status: "ok",
        cart
    });

});

app.get("/cart-count", (req, res) => {
    res.json({
        count: cart.reduce((total, p) => total + p.quantity, 0)
    });
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
