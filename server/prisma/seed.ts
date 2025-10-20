import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.transcriptionAnalysis.deleteMany();
  await prisma.transcription.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create doctor
  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. Alex Johnson',
      email: 'alex.johnson@abridge.com',
      role: 'doctor',
    },
  });

  // Create patients
  const patient1 = await prisma.patient.create({
    data: {
        mrn: 'MRN78901',
        name: 'John Smith',
        gender: 'Male',
        dob: new Date('1980-05-15'),
        age: 45,
        doctorId: doctor.id,
      }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });