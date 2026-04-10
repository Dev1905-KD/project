require("dotenv").config();
const express = require("express");
const cors = require("cors");
const driver = require("./db");

const app = express();

/* =========================
   ✅ FIXED CORS
========================= */
app.use(cors({
  origin: "https://productivity-tracker-vitap.netlify.app"
}));
app.options("*", cors());

app.use(express.json());

/* =========================
   🔐 SIGNUP (FIXED)
========================= */
app.post("/signup", async (req, res) => {
  const session = driver.session();
  const { username, password, fullname, email } = req.body;

  if (!username || !password || !fullname || !email) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }

  try {
    await session.run(
      `
      MERGE (u:User {email: $email})
      ON CREATE SET
        u.username = $username,
        u.password = $password,
        u.fullname = $fullname
      `,
      { username, password, fullname, email }
    );

    res.json({ success: true, message: "User created (or already exists)" });
  } catch (err) {
    console.error("Signup error FULL:", err);
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

  if (!input || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

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
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   ➕ ADD TASK
========================= */
app.post("/add-task", async (req, res) => {
  const session = driver.session();
  const { username, title } = req.body;

  if (!username || !title || title.trim() === "") {
    return res.status(400).json({ success: false, error: "Invalid task data" });
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
    console.error("Add task error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   📥 GET TASKS
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
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ success: false, error: err.message });
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
  } catch (err) {
    console.error("Complete task error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   ❌ DELETE TASKS
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

    res.json({ success: true });
  } catch (err) {
    console.error("Delete tasks error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* =========================
   🧪 TEST DB
========================= */
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

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});