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

// API to delete all tasks
app.delete("/delete-all-tasks", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (t:Task) DELETE t");
    console.log("✓ All tasks deleted:", result.summary.counters.updates().nodesDeleted);
    res.json({ success: true, message: "All tasks deleted" });
  } catch (err) {
    console.error("✗ Error deleting tasks:", err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.toString()
    });
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