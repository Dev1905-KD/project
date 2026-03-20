require("dotenv").config();
const express = require("express");
const cors = require("cors");
const driver = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// API to add task
app.post("/add-task", async (req, res) => {
  const session = driver.session();
  const { title } = req.body;

  try {
    await session.run(
      "CREATE (t:Task {title: $title})",
      { title }
    );
    console.log("✓ Task added:", title);
    res.send("Task added");
  } catch (err) {
    console.error("✗ Error adding task:", err.message);
    res.status(500).send(err.message);
  } finally {
    await session.close();
  }
});

// API to get tasks
app.get("/tasks", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (t:Task) RETURN t");
    const tasks = result.records.map(r => r.get("t").properties);
    res.json(tasks);
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;

// Test Neo4j connection on startup
async function testConnection() {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    console.log("✓ Neo4j connection successful");
  } catch (err) {
    console.error("✗ Neo4j connection failed:", err.message);
  } finally {
    await session.close();
  }
}

testConnection();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));