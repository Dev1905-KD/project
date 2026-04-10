require("dotenv").config();
const express = require("express");
const cors = require("cors");
const driver = require("./db");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* =========================
   🔐 SIGNUP
========================= */
app.post("/signup", async (req, res) => {
  const session = driver.session();
  const { username, password, fullname, email } = req.body;

  try {
    await session.run(
      `
      CREATE (u:User {
        username: $username,
        password: $password,
        fullname: $fullname,
        email: $email
      })
      `,
      { username, password, fullname, email }
    );

    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   🔐 LOGIN
========================= */
app.post("/login", async (req, res) => {
  const session = driver.session();
  const { input, password } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE (u.username = $input OR u.email = $input)
      AND u.password = $password
      RETURN u
      `,
      { input, password }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const user = result.records[0].get("u").properties;

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   ➕ ADD TASK (linked to user)
========================= */
app.post("/add-task", async (req, res) => {
  const session = driver.session();
  const { username, title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ success: false, error: "Task title cannot be empty" });
  }

  try {
    const result = await session.run(
      `
      MATCH (u:User {username: $username})
      CREATE (t:Task {title: $title, status: "pending"})
      CREATE (u)-[:HAS_TASK]->(t)
      RETURN t
      `,
      { username, title: title.trim() }
    );

    const task = result.records[0].get("t").properties;

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   📥 GET TASKS (user-specific)
========================= */
app.get("/tasks/:username", async (req, res) => {
  const session = driver.session();
  const { username } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u:User {username: $username})-[:HAS_TASK]->(t:Task)
      RETURN t
      `,
      { username }
    );

    const tasks = result.records.map(r => r.get("t").properties);

    res.json(tasks);
  } finally {
    await session.close();
  }
});

/* =========================
   ✅ COMPLETE TASK
========================= */
app.post("/complete-task", async (req, res) => {
  const session = driver.session();
  const { username, title } = req.body;

  try {
    await session.run(
      `
      MATCH (u:User {username: $username})-[:HAS_TASK]->(t:Task {title: $title})
      SET t.status = "completed",
          t.completedOn = date()
      `,
      { username, title }
    );

    res.json({ success: true, message: "Task completed" });
  } finally {
    await session.close();
  }
});

/* =========================
   ❌ DELETE ALL TASKS (optional)
========================= */
app.delete("/delete-all-tasks/:username", async (req, res) => {
  const session = driver.session();
  const { username } = req.params;

  try {
    await session.run(
      `
      MATCH (u:User {username: $username})-[:HAS_TASK]->(t:Task)
      DETACH DELETE t
      `,
      { username }
    );

    res.json({ success: true, message: "All tasks deleted" });
  } finally {
    await session.close();
  }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

async function testConnection() {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    console.log("✓ Neo4j connected");
  } catch (err) {
    console.error("✗ Neo4j connection failed:", err.message);
  } finally {
    await session.close();
  }
}

testConnection();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));