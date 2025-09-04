import express, { Router } from "express";
import { prisma } from "../app";
import { requireRole } from "../middleware/auth";

const router: Router = express.Router();

// Apply super admin role requirement to all routes
router.use(requireRole(["SUPER_ADMIN"]));

// Get all admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        student: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(admins);
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

// Create new admin
router.post("/admins", async (req, res) => {
  try {
    const { studentId, level, facultyId, departmentId } = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if already an admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { studentId },
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Student is already an admin" });
    }

    const admin = await prisma.admin.create({
      data: {
        studentId,
        level,
        facultyId: level === "FACULTY" ? facultyId : null,
        departmentId: level === "DEPARTMENT" ? departmentId : null,
      },
      include: {
        student: true,
      },
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Failed to create admin" });
  }
});

// Delete admin
router.delete("/admins/:id", async (req, res) => {
  try {
    await prisma.admin.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Admin removed successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ message: "Failed to remove admin" });
  }
});

export default router;
