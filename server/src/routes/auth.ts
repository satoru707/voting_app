import express, { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../app";
import { sendMagicLink } from "../utils/email";
import { log } from "console";

const router: Router = express.Router();

// Request magic link
router.post("/request-link", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("WFWF", req.body);

    if (!email) {
      return res
        .status(400)
        .json({ message: "Valid email is required", body: req.body });
    }

    // Find student by email
    const student = await prisma.student.findUnique({
      where: { matricNo: email },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate nonce and create token
    const nonce = crypto.randomBytes(32).toString("hex");
    const exp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLinkToken.create({
      data: {
        studentId: student.id,
        nonce,
        exp,
      },
    });

    // Send magic link email
    const magicLink = `${process.env.FRONTEND_URL}?token=${nonce}`;
    console.log(magicLink, student.email);
    await sendMagicLink(student.email, magicLink);

    res.json({ message: "Magic link sent to your email" });
  } catch (error) {
    console.error("Request link error:", error);
    res.status(500).json({ message: "Failed to send magic link" });
  }
});

// Verify magic link token
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Find and validate token
    const magicToken = await prisma.magicLinkToken.findUnique({
      where: { nonce: token },
      include: {
        student: {
          include: {
            admin: true,
            superAdmin: true,
          },
        },
      },
    });

    if (!magicToken || magicToken.used || magicToken.exp < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicToken.id },
      data: { used: true },
    });

    // Create session JWT
    const sessionToken = jwt.sign(
      { studentId: magicToken.student.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Determine user role
    let role: "STUDENT" | "ADMIN" | "SUPER_ADMIN" = "STUDENT";
    let adminLevel: "FACULTY" | "DEPARTMENT" | undefined;

    if (magicToken.student.superAdmin) {
      role = "SUPER_ADMIN";
    } else if (magicToken.student.admin) {
      role = "ADMIN";
      adminLevel = magicToken.student.admin.level;
    }

    res.json({
      id: magicToken.student.id,
      matricNo: magicToken.student.matricNo,
      email: magicToken.student.email,
      year: magicToken.student.year,
      facultyId: magicToken.student.facultyId,
      departmentId: magicToken.student.departmentId,
      role,
      adminLevel,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
});

export default router;
