import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../app";
import { prisma } from "../app";

interface JWTPayload {
  studentId: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        matricNo: string;
        email: string;
        year: number;
        log?: any;
        facultyId: string;
        departmentId: string;
        role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
        adminLevels?: Array<{
          level: string;
          facultyId?: string;
          departmentId?: string;
        }>;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as JWTPayload | any;
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > decoded.exp) {
      return res.status(401).json({ message: "Token expired" });
    }

    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      include: { admins: true, superAdmin: true },
    });

    if (!student) {
      return res.status(401).json({ message: "User not found" });
    }

    let role: "STUDENT" | "ADMIN" | "SUPER_ADMIN" = "STUDENT";
    let adminLevels: Array<{
      level: string;
      facultyId?: string;
      departmentId?: string;
    }> = [];

    if (student.superAdmin) {
      role = "SUPER_ADMIN";
    } else if (student.admins && student.admins.length > 0) {
      role = "ADMIN";
      adminLevels = student.admins.map((a) => ({
        level: a.level,
        facultyId: a.facultyId ?? undefined,
        departmentId: a.departmentId ?? undefined,
      }));
    }

    req.user = {
      id: student.id,
      matricNo: student.matricNo,
      email: student.email,
      year: student.year,
      facultyId: student.facultyId,
      departmentId: student.departmentId,
      role,
      adminLevels,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
