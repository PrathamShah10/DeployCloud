require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { kafka } = require("../build-server/client.js");
const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

async function initkafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topics: ["container-logs"], fromBeginning: true });

  await consumer.run({
    eachBatch: async function ({
      batch,
      heartbeat,
      commitOffsetsIfNecessary,
      resolveOffset,
    }) {
      const messages = batch.messages;
      console.log(`Recv. ${messages.length} messages..`);
      const logData = [];
      for (const message of messages) {
        if (!message.value) continue;
        const stringMessage = message.value.toString();
        const { DEPLOYMENT_ID, log } = JSON.parse(stringMessage);
        console.log({ log, DEPLOYMENT_ID });
        logData.push({ log, deploymentId: DEPLOYMENT_ID });
      }
      if (logData.length > 0) {
        try {
          await prisma.logs.createMany({
            data: logData,
          });
          for (const message of messages) {
            resolveOffset(message.offset);
            await commitOffsetsIfNecessary(message.offset);
            await heartbeat();
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
  });
}

module.exports = initkafkaConsumer;
