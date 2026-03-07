const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* carrito por usuario */
let carts = {};

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

    const { user_id, variation_id, quantity } = req.body;

    if (!user_id) {
        return res.status(400).json({
            status: "error",
            message: "user_id requerido"
        });
    }

    if (!variation_id) {
        return res.status(400).json({
            status: "error",
            message: "variation_id requerido"
        });
    }

    if (!carts[user_id]) {
        carts[user_id] = [];
    }

    const cart = carts[user_id];

    const existing = cart.find(p => p.variation_id === variation_id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ variation_id, quantity });
    }

    res.json({
        status: "ok",
        cart
    });

});

/* VER CARRITO */
app.get("/cart/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const cart = carts[user_id] || [];

    res.json({
        status: "ok",
        cart
    });

});

/* ELIMINAR PRODUCTO DEL CARRITO */
app.post("/remove-from-cart", (req, res) => {

    const { user_id, variation_id } = req.body;

    if (!carts[user_id]) {
        return res.json({
            status: "ok",
            cart: []
        });
    }

    carts[user_id] = carts[user_id].filter(
        p => p.variation_id !== variation_id
    );

    res.json({
        status: "ok",
        cart: carts[user_id]
    });

});

/* CONTAR PRODUCTOS DEL CARRITO */
app.get("/cart-count/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const cart = carts[user_id] || [];

    const count = cart.reduce((total, p) => total + p.quantity, 0);

    res.json({
        count
    });

});

/* VACIAR CARRITO */
app.get("/clear-cart/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    carts[user_id] = [];

    res.json({
        status: "ok",
        message: "carrito vaciado"
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor carrito iniciado en puerto " + PORT);
});
