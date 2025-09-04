export interface Student {
  id: string;
  matricNo: string;
  email: string;
  year: number;
  facultyId: string;
  departmentId: string;
}

export interface Admin {
  id: string;
  studentId: string;
  level: 'FACULTY' | 'DEPARTMENT';
  facultyId?: string;
  departmentId?: string;
}

export interface SuperAdmin {
  id: string;
  studentId: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  scope: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT';
  facultyId?: string;
  departmentId?: string;
  allowedYears: number[];
  startAt: Date;
  endAt: Date;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  createdBy: string;
  integrityHead?: string;
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  electionId: string;
  studentId: string;
  position: string;
  student?: Student;
}

export interface Ballot {
  id: string;
  electionId: string;
  voterId: string;
  candidateId: string;
  position: string;
  castAt: Date;
  fingerprint: string;
}

export interface ElectionAdmin {
  electionId: string;
  adminId: string;
}

export interface CloseRequest {
  id: string;
  electionId: string;
  adminId: string;
}

export interface MagicLinkToken {
  id: string;
  studentId: string;
  nonce: string;
  exp: Date;
  used: boolean;
}

export interface User extends Student {
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  adminLevel?: 'FACULTY' | 'DEPARTMENT';
}

export interface VoteRequest {
  candidateId: string;
  position: string;
}

export interface AuthRequest {
  email: string;
}

export interface VerifyRequest {
  token: string;
}

export interface CreateElectionRequest {
  title: string;
  description: string;
  scope: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT';
  facultyId?: string;
  departmentId?: string;
  allowedYears: number[];
  startAt: string;
  endAt: string;
}

export interface CreateCandidateRequest {
  studentId: string;
  position: string;
}

export interface CreateAdminRequest {
  studentId: string;
  level: 'FACULTY' | 'DEPARTMENT';
  facultyId?: string;
  departmentId?: string;
}