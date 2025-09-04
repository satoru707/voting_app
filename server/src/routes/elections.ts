import express, { Router } from "express";
import { prisma } from "../app";
import { generateFingerprint } from "../utils/integrity";

const router: Router = express.Router();

// Get elections for current user
router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { status } = req.query;

    const elections = await prisma.election.findMany({
      where: {
        AND: [
          // Status filter
          ...(status ? [{ status: status as any }] : []),
          // Scope and permission filtering
          {
            OR: [
              { scope: "UNIVERSITY" },
              {
                scope: "FACULTY",
                facultyId: req.user.facultyId,
              },
              {
                scope: "DEPARTMENT",
                facultyId: req.user.facultyId,
                departmentId: req.user.departmentId,
              },
            ],
          },
          // Year eligibility
          { allowedYears: { has: req.user.year } },
        ],
      },
      include: {
        candidates: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(elections);
  } catch (error) {
    console.error("Get elections error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});

// Get specific election
router.get("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        candidates: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check if user is eligible for this election
    const isEligible =
      election.allowedYears.includes(req.user.year) &&
      (election.scope === "UNIVERSITY" ||
        (election.scope === "FACULTY" &&
          election.facultyId === req.user.facultyId) ||
        (election.scope === "DEPARTMENT" &&
          election.facultyId === req.user.facultyId &&
          election.departmentId === req.user.departmentId));

    if (!isEligible) {
      return res
        .status(403)
        .json({ message: "Not eligible for this election" });
    }

    res.json(election);
  } catch (error) {
    console.error("Get election error:", error);
    res.status(500).json({ message: "Failed to fetch election" });
  }
});

// Vote in election
router.post("/:id/votes", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { votes } = req.body; // Array of { candidateId, position }
    const electionId = req.params.id;

    // Validate election exists and is open
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election || election.status !== "OPEN") {
      return res
        .status(400)
        .json({ message: "Election not available for voting" });
    }

    // Check if user is a candidate in this election
    const isCandidate = await prisma.candidate.findFirst({
      where: {
        electionId,
        studentId: req.user.id,
      },
    });

    if (isCandidate) {
      return res
        .status(403)
        .json({ message: "Candidates cannot vote in their own election" });
    }

    // Check if user is eligible for this election (reusing logic from GET /:id)
    const isEligible =
      election.allowedYears.includes(req.user.year) &&
      (election.scope === "UNIVERSITY" ||
        (election.scope === "FACULTY" &&
          election.facultyId === req.user.facultyId) ||
        (election.scope === "DEPARTMENT" &&
          election.facultyId === req.user.facultyId &&
          election.departmentId === req.user.departmentId));

    if (!isEligible) {
      return res
        .status(403)
        .json({ message: "Not eligible to vote in this election" });
    }

    // Check if user already voted
    const existingVote = await prisma.ballot.findFirst({
      where: {
        electionId,
        voterId: req.user.id,
      },
    });

    if (existingVote) {
      return res
        .status(400)
        .json({ message: "You have already voted in this election" });
    }

    // Process votes with hash-chain integrity
    const ballots = [];
    for (const vote of votes) {
      // Get previous fingerprint for chain
      const prevBallot = await prisma.ballot.findFirst({
        where: { electionId },
        orderBy: { castAt: "desc" },
      });

      const prevFingerprint =
        prevBallot?.fingerprint || `genesis:${electionId}`;
      const currentFingerprint = generateFingerprint(prevFingerprint, {
        electionId,
        voterId: req.user.id,
        candidateId: vote.candidateId,
        position: vote.position,
        timestamp: new Date(),
      });

      ballots.push({
        electionId,
        voterId: req.user.id,
        candidateId: vote.candidateId,
        position: vote.position,
        fingerprint: currentFingerprint,
      });
    }

    // Save all ballots
    await prisma.ballot.createMany({
      data: ballots,
    });

    res.json({ message: "Vote cast successfully" });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Failed to cast vote" });
  }
});

// Get election results
router.get("/:id/results", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        candidates: {
          include: {
            student: true,
          },
        },
        ballots: true,
      },
    });

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.status !== "CLOSED") {
      return res.status(400).json({ message: "Results not available yet" });
    }

    // Calculate results
    const results = election.candidates.map((candidate) => {
      const voteCount = election.ballots.filter(
        (ballot) => ballot.candidateId === candidate.id
      ).length;

      const positionVotes = election.ballots.filter(
        (ballot) => ballot.position === candidate.position
      ).length;

      const percentage =
        positionVotes > 0 ? (voteCount / positionVotes) * 100 : 0;

      return {
        candidate,
        voteCount,
        percentage,
      };
    });

    // Verify integrity
    const integrityVerified = await verifyElectionIntegrity(election.id);

    res.json({
      election,
      results,
      totalVotes: election.ballots.length,
      integrityVerified,
    });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// Verify election integrity
async function verifyElectionIntegrity(electionId: string): Promise<boolean> {
  try {
    const ballots = await prisma.ballot.findMany({
      where: { electionId },
      orderBy: { castAt: "asc" },
    });

    let expectedFingerprint = `genesis:${electionId}`;

    for (const ballot of ballots) {
      const computedFingerprint = generateFingerprint(expectedFingerprint, {
        electionId: ballot.electionId,
        voterId: ballot.voterId,
        candidateId: ballot.candidateId,
        position: ballot.position,
        timestamp: ballot.castAt,
      });

      if (computedFingerprint !== ballot.fingerprint) {
        return false;
      }

      expectedFingerprint = ballot.fingerprint;
    }

    return true;
  } catch (error) {
    console.error("Integrity verification error:", error);
    return false;
  }
}

export default router;
