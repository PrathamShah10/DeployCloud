require("dotenv").config();
const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { authenticateToken } = require("./middleware.js");
const { kafka } = require("../build-server/client.js");
// const { Server } = require('socket.io')
// const Redis = require('ioredis')

const prisma = new PrismaClient();
const app = express();
const PORT = 9000;

// const subscriber = new Redis('')

// const io = new Server({ cors: '*' })

// io.on('connection', socket => {
//     socket.on('subscribe', channel => {
//         socket.join(channel)
//         socket.emit('message', `Joined ${channel}`)
//     })
// })

// io.listen(9002, () => console.log('Socket Server 9002'))

// console.log(process.env.AWS_SECURITY_GROUPS.split(','))

const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

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

app.use(express.json());

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
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
  return res.json({ message: "project created" });
});

app.post("/deploy", async (req, res) => {
  const { projectId } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  // Check if there is no running deployement
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

  await ecsClient.send(command);

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
        const { DEPLOYEMENT_ID, log } = JSON.parse(stringMessage);
        console.log({ log, DEPLOYEMENT_ID });
        logData.push({ log, deploymentId: DEPLOYEMENT_ID });
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

initkafkaConsumer();

app.listen(PORT, () => console.log(`API Server Running..${PORT}`));
