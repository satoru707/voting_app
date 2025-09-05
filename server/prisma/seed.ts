import {
  PrismaClient,
  AdminLevel,
  ElectionScope,
  ElectionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const students = await Promise.all([
    prisma.student.upsert({
      where: { email: "praisethegreat2007@gmail.com" },
      update: {},
      create: {
        matricNo: "ST2021001",
        email: "praisethegreat2007@gmail.com",
        year: 300,
        facultyId: "ENGINEERING",
        departmentId: "COMPUTER_SCIENCE",
      },
    }),
    prisma.student.upsert({
      where: { email: "petolulope7@gmail.com" },
      update: {},
      create: {
        matricNo: "ST2021002",
        email: "petolulope7@gmail.com",
        year: 400,
        facultyId: "ENGINEERING",
        departmentId: "ELECTRICAL",
      },
    }),
    prisma.student.upsert({
      where: { email: "tolulopeolaoye067@gmail.com" },
      update: {},
      create: {
        matricNo: "SA2020001",
        email: "tolulope067@gmail.com",
        year: 500,
        facultyId: "ADMINISTRATION",
        departmentId: "IT",
      },
    }),
  ]);

  // Create admin
  await prisma.admin.upsert({
    where: { studentId: students[1].id },
    update: {},
    create: {
      studentId: students[1].id,
      level: AdminLevel.FACULTY,
      facultyId: "ENGINEERING",
    },
  });

  // Create super admin
  await prisma.superAdmin.upsert({
    where: { studentId: students[2].id },
    update: {},
    create: {
      studentId: students[2].id,
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
  console.log("Student: praisethegreat2007@gmail.com");
  console.log("Admin: petolulope7@gmail.com");
  console.log("Super Admin: tolulope067@gmail.com");
}

seed();
// .then(async () => {
//   await prisma.$disconnect();
// })
// .catch(async (e) => {
//   console.error(e);
//   await prisma.$disconnect();
//   process.exit(1);
// });
