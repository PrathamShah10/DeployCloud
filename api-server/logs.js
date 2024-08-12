const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();
router.get("/logs/:id", async (req, res) => {
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

module.exports = router;
