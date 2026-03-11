const express = require("express");
const cors = require("cors");
const fs = require("fs");
const puppeteer = require("puppeteer");
const CART_FILE = "./carts.json";

function guardarCarritos() {
    fs.writeFileSync(CART_FILE, JSON.stringify(carts, null, 2));
}

const app = express();

app.use(cors());
app.use(express.json());

/* carrito por usuario */
let carts = {};

if (fs.existsSync(CART_FILE)) {
    try {
        carts = JSON.parse(fs.readFileSync(CART_FILE));
    } catch (err) {
        carts = {};
    }
}

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
        existing.quantity += Number(quantity);
    } else {
        cart.push({ variation_id, quantity: Number(quantity) });
    }

    guardarCarritos();

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

/* CAMBIAR CANTIDAD */
app.post("/update-cart", (req, res) => {

    const { user_id, variation_id, quantity = 1 } = req.body;

    if (!carts[user_id]) {
        return res.json({
            status: "ok",
            cart: []
        });
    }

    const item = carts[user_id].find(p => p.variation_id === variation_id);

    if (item) {

        item.quantity += Number(quantity);

        if (item.quantity <= 0) {
            carts[user_id] = carts[user_id].filter(
                p => p.variation_id !== variation_id
            );
        }

    }
    guardarCarritos();
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

/* VACIAR CARRITO */
app.get("/clear-cart/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    carts[user_id] = [];
    guardarCarritos();
    res.json({
        status: "ok",
        message: "carrito vaciado"
    });

});

/* maneja pdf */
app.post("/cotizacion-pdf", async (req, res) => {

const html = req.body.html;

try {

const browser = await puppeteer.launch({
args:["--no-sandbox","--disable-setuid-sandbox"]
});

const page = await browser.newPage();

await page.setContent(html,{waitUntil:"networkidle0"});

const pdf = await page.pdf({
format:"A4",
printBackground:true
});

await browser.close();

res.set({
"Content-Type":"application/pdf",
"Content-Disposition":"attachment; filename=cotizacion.pdf"
});

res.send(pdf);

}catch(err){

console.error(err);
res.status(500).send("error generando pdf");

}

});

/* fin maneja pdf */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor carrito iniciado en puerto " + PORT);
});
