const express = require("express");
const cors = require("cors");

const authRoutes = require("./auth.js");
const projectRoutes = require("./project.js");
const deployRoutes = require("./deploy.js");
const logRoutes = require("./logs.js");

const app = express();
const PORT = 9000;

const initkafkaConsumer = require("./kafka.js");

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/", projectRoutes);
app.use("/", deployRoutes);
app.use("/", logRoutes);

app.listen(PORT, () => {
  console.log(`API Server Running..${PORT}`);
  // Initialize Kafka consumer
  initkafkaConsumer().catch((error) => {
    console.error("Failed to initialize Kafka consumer:", error);
  });
});
