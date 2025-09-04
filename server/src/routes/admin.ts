import express, { Router } from "express";
import { prisma } from "../app";
import { requireRole } from "../middleware/auth";

const router: Router = express.Router();

// Apply admin role requirement to all routes
router.use(requireRole(["ADMIN", "SUPER_ADMIN"]));

// Get elections managed by current admin
router.get("/elections", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const whereClause: any = {};

    // Filter based on admin level
    if (req.user.role === "ADMIN") {
      if (req.user.adminLevel === "FACULTY") {
        whereClause.facultyId = req.user.facultyId;
      } else if (req.user.adminLevel === "DEPARTMENT") {
        whereClause.departmentId = req.user.departmentId;
      }
    }
    // SUPER_ADMIN can see all elections

    const elections = await prisma.election.findMany({
      where: whereClause,
      include: {
        candidates: {
          include: {
            student: true,
          },
        },
        creator: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(elections);
  } catch (error) {
    console.error("Get admin elections error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});

// Create new election
router.post("/elections", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const {
      title,
      description,
      scope,
      facultyId,
      departmentId,
      allowedYears,
      startAt,
      endAt,
    } = req.body;

    // Validate permissions
    if (req.user.role === "ADMIN") {
      if (req.user.adminLevel === "FACULTY" && scope === "UNIVERSITY") {
        return res.status(403).json({
          message: "Faculty admins cannot create university-wide elections",
        });
      }
      if (req.user.adminLevel === "DEPARTMENT" && scope !== "DEPARTMENT") {
        return res.status(403).json({
          message:
            "Department admins can only create department-level elections",
        });
      }
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        scope,
        facultyId:
          scope !== "UNIVERSITY" ? facultyId || req.user.facultyId : null,
        departmentId:
          scope === "DEPARTMENT" ? departmentId || req.user.departmentId : null,
        allowedYears,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        createdBy: req.user.id,
      },
    });

    res.status(201).json(election);
  } catch (error) {
    console.error("Create election error:", error);
    res.status(500).json({ message: "Failed to create election" });
  }
});

// Add candidate to election
router.post("/elections/:id/candidates", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { studentId, position } = req.body;
    const electionId = req.params.id;

    // Verify admin has permission for this election
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check permissions
    if (req.user.role === "ADMIN") {
      if (
        req.user.adminLevel === "FACULTY" &&
        election.facultyId !== req.user.facultyId
      ) {
        return res
          .status(403)
          .json({ message: "No permission for this election" });
      }
      if (
        req.user.adminLevel === "DEPARTMENT" &&
        election.departmentId !== req.user.departmentId
      ) {
        return res
          .status(403)
          .json({ message: "No permission for this election" });
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        electionId,
        studentId,
        position,
      },
      include: {
        student: true,
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error("Add candidate error:", error);
    res.status(500).json({ message: "Failed to add candidate" });
  }
});

// Request to close election
router.post("/elections/:id/close-request", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const electionId = req.params.id;

    // Find admin record
    const admin = await prisma.admin.findUnique({
      where: { studentId: req.user.id },
    });

    if (!admin && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Ensure the admin is within the election's scope (for non-SUPER_ADMINs)
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Super Admins can close any election. Other admins need scope checks.
    if (req.user.role !== "SUPER_ADMIN") {
      if (election.scope === "UNIVERSITY") {
        return res
          .status(403)
          .json({
            message: "Only Super Admins can close university-wide elections",
          });
      }
      if (
        election.scope === "FACULTY" &&
        (req.user.adminLevel !== "FACULTY" ||
          election.facultyId !== req.user.facultyId)
      ) {
        return res
          .status(403)
          .json({
            message: "Not authorized to close this faculty-level election",
          });
      }
      if (
        election.scope === "DEPARTMENT" &&
        (req.user.adminLevel !== "DEPARTMENT" ||
          election.departmentId !== req.user.departmentId)
      ) {
        return res
          .status(403)
          .json({
            message: "Not authorized to close this department-level election",
          });
      }
    }

    // Check if this admin has already requested to close this election
    const existingCloseRequest = await prisma.closeRequest.findUnique({
      where: {
        electionId_adminId: {
          electionId,
          adminId: admin?.id || req.user.id,
        },
      },
    });

    if (existingCloseRequest) {
      return res
        .status(400)
        .json({ message: "You have already requested to close this election" });
    }

    // Create close request
    await prisma.closeRequest.create({
      data: {
        electionId,
        adminId: admin?.id || req.user.id,
      },
    });

    // Determine total admins in scope and approval threshold
    let totalAdminsInScope = 0;
    if (election.scope === "UNIVERSITY") {
      totalAdminsInScope = await prisma.superAdmin.count(); // Only super admins can approve university-wide
    } else if (election.scope === "FACULTY") {
      totalAdminsInScope = await prisma.admin.count({
        where: { level: "FACULTY", facultyId: election.facultyId },
      });
    } else if (election.scope === "DEPARTMENT") {
      totalAdminsInScope = await prisma.admin.count({
        where: { level: "DEPARTMENT", departmentId: election.departmentId },
      });
    }

    const approvalsNeeded = Math.ceil(totalAdminsInScope / 2);

    const currentApprovals = await prisma.closeRequest.count({
      where: { electionId },
    });

    if (currentApprovals >= approvalsNeeded) {
      await closeElection(electionId);
      res.json({
        message: "Election closed successfully after sufficient approvals",
      });
    } else {
      res.json({
        message: `Close request submitted. ${currentApprovals}/${approvalsNeeded} approvals received.`,
      });
    }
  } catch (error) {
    console.error("Close request error:", error);
    res.status(500).json({ message: "Failed to request close" });
  }
});

// Helper function to close election and finalize integrity
export async function closeElection(electionId: string) {
  try {
    // Get final ballot to get the last fingerprint
    const lastBallot = await prisma.ballot.findFirst({
      where: { electionId },
      orderBy: { castAt: "desc" },
    });

    // Update election status and set integrity head
    await prisma.election.update({
      where: { id: electionId },
      data: {
        status: "CLOSED",
        integrityHead: lastBallot?.fingerprint || `genesis:${electionId}`,
      },
    });
  } catch (error) {
    console.error("Close election error:", error);
  }
}

export default router;
