const express = require("express");
const { z } = require("zod");
const { generateSlug } = require("random-word-slugs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("./middleware.js");

const router = express.Router();

router.get("/project", authenticateToken, async (req, res) => {
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

router.post("/project", authenticateToken, async (req, res) => {
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

module.exports = router;
