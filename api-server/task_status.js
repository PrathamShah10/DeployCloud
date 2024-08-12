const { DescribeTasksCommand } = require("@aws-sdk/client-ecs");
const { ecsClient, config } = require("./ecsClient.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function checkTaskStatus(taskId, deploymentId) {
  const command = new DescribeTasksCommand({
    cluster: config.CLUSTER,
    tasks: [taskId],
  });

  const response = await ecsClient.send(command);
  const task = response.tasks[0];
  console.log(`rn task status is ${task.lastStatus}`);
  if (task && task.lastStatus === "STOPPED") {
    // Update the deployment status in the database
    await prisma.deployement.update({
      where: { id: deploymentId },
      data: { status: "READY" },
    });
    return "READY";
  } else {
    return "IN_PROGRESS";
  }
}

module.exports = checkTaskStatus;
