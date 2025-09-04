import express, { Router } from "express";
import { prisma } from "../app";

const router: Router = express.Router();

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json(req.user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
});

export default router;
