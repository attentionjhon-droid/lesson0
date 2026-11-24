import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 9 problems and updating coupons for NDTU Coding Platform...');

  // 1. Admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN',
      name: 'Bosh Administrator',
      coupons: 500,
    },
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      name: 'Bosh Administrator',
      coupons: 500,
    },
  });

  // 2. Student user
  const hashedStudentPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { username: 'aralcoder' },
    update: {
      role: 'USER',
      name: 'NDTU Foydalanuvchisi',
    },
    create: {
      username: 'aralcoder',
      name: 'NDTU Foydalanuvchisi',
      password: hashedStudentPassword,
      role: 'USER',
      coupons: 0,
    },
  });

  const problemsData = [
    // --- OSON (10 💵) ---
    {
      id: 1,
      slug: 'ikki-sonning-yigindisi',
      title: "Ikki sonning yig'indisi",
      difficulty: "Oson",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Sizga ikkita butun son A va B berilgan. Ularning yig'indisini hisoblovchi dastur tuzing.",
      inputFormat: "Bitta qatorda bo'sh joy bilan ajratilgan ikkita butun son A va B kiritiladi (-10^9 ≤ A, B ≤ 10^9).",
      outputFormat: "Masala javobini, ya'ni A + B qiymatini yagona qatorda chiqaring.",
      notes: "C++ tilida 'int' yoki 'long long' turidan foydalanishingiz mumkin. Kiritish uchun cin, chiqarish uchun cout ishlatiladi.",
      sampleInput: "4 7",
      sampleOutput: "11",
      testCases: [
        { input: "4 7", output: "11", isSample: true },
        { input: "100 250", output: "350", isSample: false },
        { input: "-15 30", output: "15", isSample: false },
        { input: "0 0", output: "0", isSample: false },
        { input: "-50 -40", output: "-90", isSample: false },
      ],
    },
    {
      id: 2,
      slug: 'togri-tortburchak-yuzi',
      title: "To'g'ri to'rtburchak yuzi",
      difficulty: "Oson",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "To'g'ri to'rtburchakning tomonlari a va b berilgan. Uning yuzini (S = a * b) hisoblang.",
      inputFormat: "Bitta qatorda ikkita musbat butun son a va b kiritiladi (1 ≤ a, b ≤ 10^4).",
      outputFormat: "To'g'ri to'rtburchakning yuzini butun son sifatida chiqaring.",
      notes: "Formula: S = a * b.",
      sampleInput: "5 8",
      sampleOutput: "40",
      testCases: [
        { input: "5 8", output: "40", isSample: true },
        { input: "12 10", output: "120", isSample: false },
        { input: "1 1", output: "1", isSample: false },
        { input: "25 4", output: "100", isSample: false },
        { input: "100 50", output: "5000", isSample: false },
      ],
    },
    {
      id: 3,
      slug: 'uchta-sondan-eng-kattasi',
      title: "Uchta sondan eng kattasi",
      difficulty: "Oson",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Uchta butun son A, B va C berilgan. Ular orasidan eng katta qiymatga ega bo'lganini toping.",
      inputFormat: "Bitta qatorda bo'sh joy bilan ajratilgan uchta butun son A, B va C kiritiladi (-10^9 ≤ A, B, C ≤ 10^9).",
      outputFormat: "Uchta sonning eng kattasini chiqaring.",
      notes: "std::max funksiyasidan yoki shartli operatorlardan (if / else) foydalanishingiz mumkin.",
      sampleInput: "15 42 27",
      sampleOutput: "42",
      testCases: [
        { input: "15 42 27", output: "42", isSample: true },
        { input: "5 2 9", output: "9", isSample: false },
        { input: "99 12 1", output: "99", isSample: false },
        { input: "-10 -5 -20", output: "-5", isSample: false },
        { input: "7 7 7", output: "7", isSample: false },
      ],
    },

    // --- O'RTA (20 💵) ---
    {
      id: 4,
      slug: 'n-faktorial',
      title: "N sonining faktoriali",
      difficulty: "O'rta",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Berilgan nomanfiy butun son N ning faktorialini (N! = 1 * 2 * ... * N) hisoblang. 0! = 1 deb qabul qilinadi.",
      inputFormat: "Bitta qatorda butun son N kiritiladi (0 ≤ N ≤ 12).",
      outputFormat: "N sonining faktorial qiymatini butun son sifatida chiqaring.",
      notes: "for yoki while tsiklidan foydalaning. Dastlabki qiymat: ans = 1.",
      sampleInput: "5",
      sampleOutput: "120",
      testCases: [
        { input: "5", output: "120", isSample: true },
        { input: "0", output: "1", isSample: false },
        { input: "1", output: "1", isSample: false },
        { input: "6", output: "720", isSample: false },
        { input: "10", output: "3628800", isSample: false },
      ],
    },
    {
      id: 5,
      slug: 'juft-sonlar-yigindisi',
      title: "1 dan N gacha juft sonlar yig'indisi",
      difficulty: "O'rta",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "1 dan N gacha bo'lgan barcha juft butun sonlarning yig'indisini toping.",
      inputFormat: "Bitta qatorda musbat butun son N kiritiladi (1 ≤ N ≤ 10^4).",
      outputFormat: "Barcha juft sonlar yig'indisini butun son sifatida chiqaring.",
      notes: "Masalan N = 10 bo'lsa, 2 + 4 + 6 + 8 + 10 = 30.",
      sampleInput: "10",
      sampleOutput: "30",
      testCases: [
        { input: "10", output: "30", isSample: true },
        { input: "1", output: "0", isSample: false },
        { input: "4", output: "6", isSample: false },
        { input: "15", output: "56", isSample: false },
        { input: "100", output: "2550", isSample: false },
      ],
    },
    {
      id: 6,
      slug: 'massivning-eng-kichigi',
      title: "Massivning eng kichik elementi",
      difficulty: "O'rta",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "N ta butun sondan iborat massiv berilgan. Massivdagi eng kichik (minimum) qiymatga ega bo'lgan elementni toping.",
      inputFormat: "Birinchi son N (1 ≤ N ≤ 100), undan keyin N ta butun son kiritiladi (-10^6 ≤ A[i] ≤ 10^6).",
      outputFormat: "Massivdagi eng kichik elementni yagona qatorda chiqaring.",
      notes: "Kiritishni for tsikli bilan o'qib, min qiymatni saqlab boring.",
      sampleInput: "5 12 5 8 3 19",
      sampleOutput: "3",
      testCases: [
        { input: "5 12 5 8 3 19", output: "3", isSample: true },
        { input: "1 42", output: "42", isSample: false },
        { input: "4 -5 -12 -1 0", output: "-12", isSample: false },
        { input: "3 100 200 300", output: "100", isSample: false },
        { input: "6 8 8 8 8 8 8", output: "8", isSample: false },
      ],
    },

    // --- QIYIN (30 💵) ---
    {
      id: 7,
      slug: 'tub-sonni-aniqlash',
      title: "Tub sonni aniqlash (Prime)",
      difficulty: "Qiyin",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Berilgan butun son N tub (prime) yoki tub emasligini aniqlang. Agar tub bo'lsa 'YES', aks holda 'NO' deb chiqaring. (Tub son faqat 1 ga va o'ziga bo'linadigan 1 dan katta sondir).",
      inputFormat: "Bitta butun son N kiritiladi (1 ≤ N ≤ 10^6).",
      outputFormat: "N tub bo'lsa YES, aks holda NO chiqaring.",
      notes: "N < 2 bo'lsa tub emas. i * i <= N gacha tekshirish tavsiya etiladi.",
      sampleInput: "7",
      sampleOutput: "YES",
      testCases: [
        { input: "7", output: "YES", isSample: true },
        { input: "1", output: "NO", isSample: false },
        { input: "4", output: "NO", isSample: false },
        { input: "13", output: "YES", isSample: false },
        { input: "97", output: "YES", isSample: false },
      ],
    },
    {
      id: 8,
      slug: 'fibonachchi-keti',
      title: "Fibonachchi sonlari (N-had)",
      difficulty: "Qiyin",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Fibonachchi ketma-ketligining N-hadini toping. Ketma-ketlik: F(1) = 1, F(2) = 1, F(3) = 2, F(4) = 3, F(5) = 5, F(n) = F(n-1) + F(n-2).",
      inputFormat: "Bitta butun son N kiritiladi (1 ≤ N ≤ 45).",
      outputFormat: "F(N) qiymatini chiqaring.",
      notes: "Katta sonlar uchun 'long long' yoki massiv/tsikldan foydalaning.",
      sampleInput: "7",
      sampleOutput: "13",
      testCases: [
        { input: "7", output: "13", isSample: true },
        { input: "1", output: "1", isSample: false },
        { input: "2", output: "1", isSample: false },
        { input: "10", output: "55", isSample: false },
        { input: "20", output: "6765", isSample: false },
      ],
    },
    {
      id: 9,
      slug: 'takrorlangan-elementlar',
      title: "Takrorlangan elementlar soni",
      difficulty: "Qiyin",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "N ta sondan iborat massiv berilgan. Massivda bir necha marta (kamida 2 marta) uchragan turli elementlar sonini aniqlang. Masalan, [1, 2, 2, 3, 3, 3, 4] massivida '2' va '3' sonlari takrorlangan, demak javob 2.",
      inputFormat: "Birinchi son N (1 ≤ N ≤ 100). Undan keyin N ta butun son kiritiladi (-1000 ≤ A[i] ≤ 1000).",
      outputFormat: "Takrorlangan turli sonlar sonini yagona qatorda chiqaring.",
      notes: "Elementlar chastotasini hisoblash yoki saralash usulidan foydalanishingiz mumkin.",
      sampleInput: "7 1 2 2 3 3 3 4",
      sampleOutput: "2",
      testCases: [
        { input: "7 1 2 2 3 3 3 4", output: "2", isSample: true },
        { input: "5 1 2 3 4 5", output: "0", isSample: false },
        { input: "4 9 9 9 9", output: "1", isSample: false },
        { input: "6 10 20 10 20 30 40", output: "2", isSample: false },
        { input: "8 5 5 2 2 3 3 4 4", output: "4", isSample: false },
      ],
    },
  ];

  for (const prob of problemsData) {
    const { testCases, ...fields } = prob;
    await prisma.problem.upsert({
      where: { id: prob.id },
      update: {
        slug: fields.slug,
        title: fields.title,
        difficulty: fields.difficulty,
        timeLimit: fields.timeLimit,
        memoryLimit: fields.memoryLimit,
        description: fields.description,
        inputFormat: fields.inputFormat,
        outputFormat: fields.outputFormat,
        notes: fields.notes,
        sampleInput: fields.sampleInput,
        sampleOutput: fields.sampleOutput,
      },
      create: {
        ...fields,
      },
    });

    // Clean and replace testcases
    await prisma.testCase.deleteMany({
      where: { problemId: prob.id },
    });

    await prisma.testCase.createMany({
      data: testCases.map((tc) => ({
        problemId: prob.id,
        input: tc.input,
        output: tc.output,
        isSample: tc.isSample,
      })),
    });
  }

  console.log('All 9 problems with test cases and coupons configured successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
