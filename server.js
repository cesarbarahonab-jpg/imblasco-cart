const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

let carts = {};

/* URL API WooCommerce */
const WC_API = "https://imblasco.cl/wp-json/wc/store/v1/products";

/* HOME */
app.get("/", (req, res) => {
    res.send("imblasco cart backend activo");
});

/* AGREGAR AL CARRITO */
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
app.get("/cart/:user_id", async (req, res) => {

    const user_id = req.params.user_id;

    const cart = carts[user_id] || [];

    const result = [];

    for (const item of cart) {

        try {

            const r = await fetch(`${WC_API}?variation=${item.variation_id}`);
            const data = await r.json();

            if (data.length > 0) {

                const p = data[0];

                result.push({
                    variation_id: item.variation_id,
                    quantity: item.quantity,
                    name: p.name,
                    price: p.prices.price,
                    image: p.images[0]?.src,
                    sku: p.sku
                });

            }

        } catch (err) {
            console.log(err);
        }

    }

    res.json({
        status: "ok",
        cart: result
    });

});

/* CAMBIAR CANTIDAD */
app.post("/update-cart", (req, res) => {

    const { user_id, variation_id, quantity } = req.body;

    if (!carts[user_id]) {
        return res.json({
            status: "ok",
            cart: []
        });
    }

    const item = carts[user_id].find(p => p.variation_id === variation_id);

    if (item) {

        item.quantity += quantity;

        if (item.quantity <= 0) {
            carts[user_id] = carts[user_id].filter(
                p => p.variation_id !== variation_id
            );
        }

    }

    res.json({
        status: "ok",
        cart: carts[user_id]
    });

});

/* CONTAR PRODUCTOS */
app.get("/cart-count/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const cart = carts[user_id] || [];

    const count = cart.reduce((total, p) => total + p.quantity, 0);

    res.json({
        count
    });

});

/* VACIAR */
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
