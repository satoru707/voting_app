import {
  PrismaClient,
  AdminLevel,
  ElectionScope,
  ElectionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  const emailBases: string[] = [
    "praisethegreat2007",
    "petolulope7",
    "tolulope067",
  ].map((base) => `${base}@gmail.com`);

  const departments: string[] = [
    "COMPUTER_SCIENCE",
    "ELECTRICAL",
    "MECHANICAL",
    "CIVIL",
  ];

  const students: Awaited<ReturnType<typeof prisma.student.upsert>>[] = [];
  for (let i = 0; i < 20; i++) {
    const deptIndex = Math.floor(i / 5);
    const emailBaseIndex = i % emailBases.length;
    const suffix = i + 1;
    const email = `${
      emailBases[emailBaseIndex].split("@")[0]
    }${suffix}@gmail.com`;

    const student = await prisma.student.upsert({
      where: { email },
      update: {},
      create: {
        matricNo: `ST${2021000 + i}`,
        email,
        year: 300 + (i % 3) * 100,
        facultyId: "TECHNOLOGY",
        departmentId: departments[deptIndex],
      },
    });
    students.push(student);
  }

  // Create admins (2-3 per department)
  for (const dept of departments) {
    const deptStudents = students.filter((s) => s.departmentId === dept);
    const adminCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 admins
    for (let i = 0; i < adminCount; i++) {
      const student = deptStudents[i % deptStudents.length];
      await prisma.admin.upsert({
        where: { studentId: student.id },
        update: {},
        create: {
          studentId: student.id,
          level: AdminLevel.DEPARTMENT,
          facultyId: "TECHNOLOGY",
          departmentId: dept,
        },
      });
    }
  }

  // Create one super admin
  const superAdminStudent = students.find(
    (s) => s.email === "tolulope0671@gmail.com"
  );
  if (superAdminStudent) {
    await prisma.superAdmin.upsert({
      where: { studentId: superAdminStudent.id },
      update: {},
      create: {
        studentId: superAdminStudent.id,
      },
    });
  }

  // Create three elections: one faculty-level, two department-level
  const elections: Awaited<ReturnType<typeof prisma.election.upsert>>[] = [];
  // Faculty-level election
  const facultyElection = await prisma.election.upsert({
    where: { id: "election-faculty-1" },
    update: {},
    create: {
      id: "election-faculty-1",
      title: "Faculty of Technology Council Elections 2025",
      description: "Faculty-wide election for the academic year 2025.",
      scope: ElectionScope.FACULTY,
      facultyId: "TECHNOLOGY",
      allowedYears: [300, 400, 500],
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      status: ElectionStatus.OPEN,
      createdBy: superAdminStudent?.id || students[0].id,
    },
  });
  elections.push(facultyElection);

  // Department-level elections
  const deptElections = ["COMPUTER_SCIENCE", "ELECTRICAL"].map(
    async (dept, index) => {
      const election = await prisma.election.upsert({
        where: { id: `election-dept-${dept}-${index + 1}` },
        update: {},
        create: {
          id: `election-dept-${dept}-${index + 1}`,
          title: `${dept} Department Election 2025`,
          description: `Departmental election for ${dept} in 2025.`,
          scope: ElectionScope.DEPARTMENT,
          facultyId: "TECHNOLOGY",
          departmentId: dept,
          allowedYears: [300, 400], // Limit to specific years per department
          startAt: new Date(
            Date.now() + 24 * 60 * 60 * 1000 + index * 24 * 60 * 60 * 1000
          ), // Staggered start
          endAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 + index * 24 * 60 * 60 * 1000
          ), // Staggered end
          status: ElectionStatus.OPEN,
          createdBy: superAdminStudent?.id || students[0].id,
        },
      });
      return election;
    }
  );
  elections.push(...(await Promise.all(deptElections)));

  // Create candidates (one per election)
  await Promise.all(
    elections.map((election, index) => {
      const dept =
        index === 0
          ? undefined
          : index === 1
          ? "COMPUTER_SCIENCE"
          : "ELECTRICAL";
      const student = students.find(
        (s) => s.departmentId === dept || (index === 0 && s.year === 300)
      );
      if (student) {
        return prisma.candidate.upsert({
          where: { id: `candidate-${election.id}` },
          update: {},
          create: {
            id: `candidate-${election.id}`,
            electionId: election.id,
            studentId: student.id,
            position: index === 0 ? "President" : "Department Representative",
          },
        });
      }
    })
  );

  console.log("Database seeded successfully!");
  console.log("Test accounts:");
  students.forEach((student, i) => {
    if (i < 3) {
      console.log(
        `${i === 0 ? "Student" : i === 1 ? "Admin" : "Super Admin"}: ${
          student.email
        }`
      );
    }
  });
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
