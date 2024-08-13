const { kafka } = require("./client");

async function init() {
  const admin = kafka.admin();
  console.log("Admin connecting...");
  admin.connect();
  console.log("Adming Connection Success...");

  console.log("Creating Topic [container-logs]");
  await admin.createTopics({
    topics: [
      {
        topic: "container-logs",
        numPartitions: 1,
      },
    ],
  });
  console.log("Topic Created Success [container-logs]");

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

init();
