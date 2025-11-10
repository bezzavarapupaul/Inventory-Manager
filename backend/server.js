const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(express.json());

const JWT_SECRET = "mysecretkey";

// ✅ FIXED CORS (NO CALLBACK, NO SLASH, NO ERRORS)
app.use(
  cors({
    origin: [
      "https://inventory-manager-virid.vercel.app",
      "http://localhost:4200",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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

  res.json({ message: "Login successful", token, userId: user.id });
});

/******************* CRUD INVENTORY *******************/
app.post("/inventory", async (req, res) => {
  const { name, quantity, price, user_id } = req.body;

  try {
    await pool.query(
      "INSERT INTO inventory (name, quantity, price, user_id) VALUES ($1, $2, $3, $4)",
      [name, quantity, price, user_id]
    );
    res.json({ message: "Item added ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding item" });
  }
});

app.get("/inventory/:userId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM inventory WHERE user_id = $1 ORDER BY id DESC",
    [req.params.userId]
  );
  res.json(result.rows);
});

app.put("/inventory/:id", async (req, res) => {
  const { name, quantity, price } = req.body;
  await pool.query(
    "UPDATE inventory SET name = $1, quantity = $2, price = $3 WHERE id = $4",
    [name, quantity, price, req.params.id]
  );
  res.json({ message: "Item updated ✅" });
});

app.delete("/inventory/:id", async (req, res) => {
  await pool.query("DELETE FROM inventory WHERE id = $1", [req.params.id]);
  res.json({ message: "Item deleted ❌" });
});

/******************* SERVER START (IMPORTANT FOR RENDER) *********************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Backend started on port ${PORT}`)
);
