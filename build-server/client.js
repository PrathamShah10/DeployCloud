const { Kafka } = require("kafkajs");
const path = require("path");
const fs = require("fs");
const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_BROKER],
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_KEY,
    mechanism: "plain",
  },
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
});

module.exports = { kafka };
