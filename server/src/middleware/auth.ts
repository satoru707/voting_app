import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

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
        facultyId: string;
        departmentId: string;
        role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
        adminLevel?: 'FACULTY' | 'DEPARTMENT';
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.session;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    
    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      include: {
        admin: true,
        superAdmin: true,
      },
    });

    if (!student) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Determine user role
    let role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' = 'STUDENT';
    let adminLevel: 'FACULTY' | 'DEPARTMENT' | undefined;

    if (student.superAdmin) {
      role = 'SUPER_ADMIN';
    } else if (student.admin) {
      role = 'ADMIN';
      adminLevel = student.admin.level;
    }

    req.user = {
      id: student.id,
      matricNo: student.matricNo,
      email: student.email,
      year: student.year,
      facultyId: student.facultyId,
      departmentId: student.departmentId,
      role,
      adminLevel,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};