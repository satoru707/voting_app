import {
  PrismaClient,
  AdminLevel,
  ElectionScope,
  ElectionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { email: "john.doe@university.edu" },
      update: {},
      create: {
        matricNo: "ST2021001",
        email: "pe",
        year: 300,
        facultyId: "ENGINEERING",
        departmentId: "COMPUTER_SCIENCE",
      },
    }),
    prisma.student.upsert({
      where: { email: "jane.smith@university.edu" },
      update: {},
      create: {
        matricNo: "ST2021002",
        email: "jane.smith@university.edu",
        year: 400,
        facultyId: "ENGINEERING",
        departmentId: "ELECTRICAL",
      },
    }),
    prisma.student.upsert({
      where: { email: "admin@university.edu" },
      update: {},
      create: {
        matricNo: "AD2020001",
        email: "admin@university.edu",
        year: 500,
        facultyId: "ENGINEERING",
        departmentId: "COMPUTER_SCIENCE",
      },
    }),
    prisma.student.upsert({
      where: { email: "super@university.edu" },
      update: {},
      create: {
        matricNo: "SA2020001",
        email: "super@university.edu",
        year: 500,
        facultyId: "ADMINISTRATION",
        departmentId: "IT",
      },
    }),
  ]);

  // Create admin
  await prisma.admin.upsert({
    where: { studentId: students[2].id },
    update: {},
    create: {
      studentId: students[2].id,
      level: AdminLevel.FACULTY,
      facultyId: "ENGINEERING",
    },
  });

  // Create super admin
  await prisma.superAdmin.upsert({
    where: { studentId: students[3].id },
    update: {},
    create: {
      studentId: students[3].id,
    },
  });

  // Create sample election
  const election = await prisma.election.upsert({
    where: { id: "election-1" },
    update: {},
    create: {
      id: "election-1",
      title: "Student Council Elections 2025",
      description:
        "Annual student council elections for the academic year 2025. Vote for your representatives!",
      scope: ElectionScope.FACULTY,
      facultyId: "ENGINEERING",
      allowedYears: [200, 300, 400],
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      status: ElectionStatus.OPEN,
      createdBy: students[2].id,
    },
  });

  // Create candidates
  await Promise.all([
    prisma.candidate.upsert({
      where: { id: "candidate-1" },
      update: {},
      create: {
        id: "candidate-1",
        electionId: election.id,
        studentId: students[0].id,
        position: "President",
      },
    }),
    prisma.candidate.upsert({
      where: { id: "candidate-2" },
      update: {},
      create: {
        id: "candidate-2",
        electionId: election.id,
        studentId: students[1].id,
        position: "Vice President",
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log("Test accounts:");
  console.log("Student: john.doe@university.edu");
  console.log("Admin: admin@university.edu");
  console.log("Super Admin: super@university.edu");
}

main();
// .then(async () => {
//   await prisma.$disconnect();
// })
// .catch(async (e) => {
//   console.error(e);
//   await prisma.$disconnect();
//   process.exit(1);
// });
