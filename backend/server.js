const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(express.json());

const JWT_SECRET = "mysecretkey";

// ✅ Allow main Vercel domain + all preview domains + localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const PROD_FRONTEND = "https://inventory-manager-virid.vercel.app";

      if (origin === PROD_FRONTEND || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("❌ Blocked by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/******************* REGISTER ************************/
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );
    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
});

/******************* LOGIN ****************************/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0)
    return res.status(404).json({ message: "User not found" });

  const user = result.rows[0];
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch)
    return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "Login successful",
    token,
    userId: user.id,
  });
});

/******************* INVENTORY CRUD ********************/
app.post("/inventory", async (req, res) => {
  const { name, quantity, price, user_id } = req.body;
  await pool.query(
    "INSERT INTO inventory (name, quantity, price, user_id) VALUES ($1, $2, $3, $4)",
    [name, quantity, price, user_id]
  );
  res.json({ message: "Item added ✅" });
});

app.get("/inventory/:userId", async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    "SELECT * FROM inventory WHERE user_id = $1 ORDER BY id DESC",
    [userId]
  );
  res.json(result.rows);
});

app.put("/inventory/:id", async (req, res) => {
  const { name, quantity, price } = req.body;
  const id = req.params.id;

  await pool.query(
    "UPDATE inventory SET name = $1, quantity = $2, price = $3 WHERE id = $4",
    [name, quantity, price, id]
  );
  res.json({ message: "Item updated ✅" });
});

app.delete("/inventory/:id", async (req, res) => {
  await pool.query("DELETE FROM inventory WHERE id = $1", [req.params.id]);
  res.json({ message: "Item deleted ❌" });
});

/******************* START SERVER *********************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on https://inventory-manager-k10i.onrender.com`)
);
