require("dotenv").config();
const { ECSClient } = require("@aws-sdk/client-ecs");

const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const config = {
  CLUSTER: process.env.AWS_CLUSTER,
  TASK: process.env.AWS_TASK,
};

module.exports = { ecsClient, config };
