const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "mysecretkey";  // 🤫 Change this later

//-----------------------------------------------------
// REGISTER API
//-----------------------------------------------------
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

//-----------------------------------------------------
// LOGIN API
//-----------------------------------------------------
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

  res.json({ message: "Login successful", token });
});

//----------------------------------------------------

app.listen(3000, () => console.log("✅ Backend running on http://localhost:3000"));
