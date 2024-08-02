require("dotenv").config();
const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand, DescribeTasksCommand } = require("@aws-sdk/client-ecs");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { authenticateToken } = require("./middleware.js");
const { kafka } = require("../build-server/client.js");
const cors = require("cors");

const prisma = new PrismaClient();
const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

// const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

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





async function checkTaskStatus(taskId, deploymentId) {
  const command = new DescribeTasksCommand({
    cluster: config.CLUSTER,
    tasks: [taskId],
  });

  const response = await ecsClient.send(command);
  const task = response.tasks[0];

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




app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const schema = z.object({
    email: z.string(),
    password: z.string(),
    name: z.string(),
  });
  const safeParser = schema.safeParse(req.body);
  if (!safeParser) res.status(400).json({ error: "types mismatched" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(200).json({ message: "registration done." });
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const schema = z.object({
    email: z.string(),
    password: z.string(),
  });
  const safeParser = schema.safeParse(req.body);
  if (!safeParser) res.status(400).json({ error: "types mismatched" });
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/project", authenticateToken, async (req, res) => {
  const userId = req.userId;
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching projects." });
  }
});

app.get("deployments/:projectId", authenticateToken, async (req, res) => {
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

app.post("/project", authenticateToken, async (req, res) => {
  const { gitURL, name } = req.body;
  const schema = z.object({
    gitURL: z.string(),
    name: z.string(),
  });
  const safeParser = schema.safeParse(req.body);
  if (!safeParser) res.status(400).json({ error: "types mismatched" });
  const project = await prisma.project.create({
    data: {
      gitURL,
      name,
      user: { connect: { id: req.userId } },
      subDomain: generateSlug(),
    },
  });
  return res.json(project);
});

app.post("/deploy", async (req, res) => {
  const { projectId } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const deployment = await prisma.deployement.create({
    data: {
      project: { connect: { id: projectId } },
      status: "QUEUED",
    },
  });

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
          ],
        },
      ],
    },
  });

  const response = await ecsClient.send(command);
  const taskId = response.tasks[0].taskArn;

  const intervalId = setInterval(async () => {
    const status = await checkTaskStatus(taskId, deployment.id);
    if (status === "READY") {
      clearInterval(intervalId);
    }
  }, 5000);

  return res.json({ status: "queued", data: { deploymentId: deployment.id } });
});

app.get("/logs/:id", async (req, res) => {
  const { id } = req.params;
  const deploymentId = id;
  if (!deploymentId) {
    return res.status(400).json({ error: "deploymentId is required" });
  }

  try {
    const logs = await prisma.logs.findMany({
      where: {
        deploymentId: deploymentId,
      },
    });

    res.json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving logs" });
  }
});

// async function initkafkaConsumer() {
//   await consumer.connect();
//   await consumer.subscribe({ topics: ["container-logs"], fromBeginning: true });

//   await consumer.run({
//     eachBatch: async function ({
//       batch,
//       heartbeat,
//       commitOffsetsIfNecessary,
//       resolveOffset,
//     }) {
//       const messages = batch.messages;
//       console.log(`Recv. ${messages.length} messages..`);
//       const logData = [];
//       for (const message of messages) {
//         if (!message.value) continue;
//         const stringMessage = message.value.toString();
//         const { DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
//         console.log({ log, DEPLOYEMENT_ID });
//         logData.push({ log, deploymentId: DEPLOYEMENT_ID });
//       }
//       if (logData.length > 0) {
//         try {
//           await prisma.logs.createMany({
//             data: logData,
//           });
//           for (const message of messages) {
//             resolveOffset(message.offset);
//             await commitOffsetsIfNecessary(message.offset);
//             await heartbeat();
//           }
//         } catch (err) {
//           console.log(err);
//         }
//       }
//     },
//   });
// }

// initkafkaConsumer();

app.listen(PORT, () => console.log(`API Server Running..${PORT}`));
