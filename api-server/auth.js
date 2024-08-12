const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();
router.post("/signup", async (req, res) => {
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
    await prisma.user.create({
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

router.post("/signin", async (req, res) => {
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

module.exports = router;