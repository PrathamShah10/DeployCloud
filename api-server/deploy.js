require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("./middleware.js");
const checkTaskStatus = require("./task_status.js");
const { ecsClient, config } = require("./ecsClient.js");
const { RunTaskCommand } = require("@aws-sdk/client-ecs");
const router = express.Router();

router.post("/deploy", async (req, res) => {
  const { projectId } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const deployment = await prisma.deployement.create({
    data: {
      project: { connect: { id: projectId } },
      status: "QUEUED",
    },
  });
  console.log(`deployment_id ${deployment.id}`);
  // Spin the container
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: process.env.AWS_SUBNETS.split(","),
        securityGroups: process.env.AWS_SECURITY_GROUPS.split(","),
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-imagecontainer",
          environment: [
            { name: "GIT_REPOSITORY__URL", value: project.gitURL },
            { name: "PROJECT_ID", value: project.subDomain },
            { name: "DEPLOYMENT_ID", value: deployment.id },
            { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
            {
              name: "AWS_SECRET_ACCESS_KEY",
              value: process.env.AWS_SECRET_ACCESS_KEY,
            },
            {
              name: "KAFKA_BROKER",
              value: process.env.KAFKA_BROKER,
            },
            {
              name: "KAFKA_USERNAME",
              value: process.env.KAFKA_USERNAME,
            },

            {
              name: "KAFKA_KEY",
              value: process.env.KAFKA_KEY,
            },
          ],
        },
      ],
    },
  });

  const response = await ecsClient.send(command);
  const taskId = response.tasks[0].taskArn;
  console.log(`taskid is ${taskId}`);
  const intervalId = setInterval(async () => {
    const status = await checkTaskStatus(taskId, deployment.id);
    if (status === "READY") {
      clearInterval(intervalId);
    }
  }, 5000);

  return res.json({ status: "queued", data: { deploymentId: deployment.id } });
});

router.get("/deployments/:projectId", authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  try {
    const deployments = await prisma.deployement.findMany({
      where: {
        projectId,
      },
    });

    res.status(200).json(deployments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching deployments." });
  }
});

module.exports = router;
