import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole, UserStatus } from '../user/users.entity';
import { CourseEntity, CourseLevel } from '../course/courses.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const DUMMY_COURSES: Partial<CourseEntity>[] = [
  {
    title: 'Detecting Financial Deception Risks from the Inside',
    description: 'Occupational fraud involves the use of one’s occupation for personal enrichment through the deliberate misuse or misapplication of the employing organization’s resources or assets. This session will help you understand common fraud schemes, recognise red flags, and implement preventive measures.\n\nBy the end of this session, participants will be able to: Establish a foundational understanding of what occupational fraud is and why it matters; Recognise common fraud schemes; Identify red flags and detection methods; Appreciate stakeholder responsibility in fraud prevention and governance; Implement preventive measures.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    freeOrPaid: false,
    amount: 0,
    level: CourseLevel.Intermediate,
  },
  {
    title: 'The Power of Speaking Up - Conversations on Whistleblowing',
    description: 'Learn about the importance of ethical reporting and whistleblowing in organisations. Understand protections, processes, and how to create a culture where speaking up is valued.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    freeOrPaid: false,
    amount: 0,
    level: CourseLevel.Beginner,
  },
  {
    title: 'Key Differences Between US GAAP and IFRS: Presentation and Disclosure',
    description: 'A practical guide to the main presentation and disclosure differences between US GAAP and IFRS. Essential for finance professionals working in global reporting environments.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    freeOrPaid: true,
    amount: 49.99,
    level: CourseLevel.Advanced,
  },
  {
    title: 'A Business First Approach to AI in Fusion Applications',
    description: 'Explore how AI is transforming business processes in modern ERP and fusion applications. Learn to leverage AI for efficiency and decision-making.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    freeOrPaid: false,
    amount: 0,
    level: CourseLevel.Beginner,
  },
  {
    title: 'Sanctions Compliance for Finance Professionals',
    description: 'Understand sanctions regimes, compliance obligations, and best practices for screening and reporting. Stay ahead in a rapidly changing regulatory landscape.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    freeOrPaid: true,
    amount: 39.99,
    level: CourseLevel.Intermediate,
  },
  {
    title: 'IAS 36 in Action: Practical Case Studies on Asset Impairment',
    description: 'Apply IAS 36 to real-world scenarios. Work through case studies on impairment of goodwill, cash-generating units, and disclosure requirements.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    freeOrPaid: false,
    amount: 0,
    level: CourseLevel.Advanced,
  },
  {
    title: 'Getting Started on Sustainability Reporting for Your SME',
    description: 'Introduction to sustainability reporting frameworks and how small and medium enterprises can begin their reporting journey effectively.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    freeOrPaid: false,
    amount: 0,
    level: CourseLevel.Beginner,
  },
  {
    title: "Navigating APAC's Economic Currents: Building Resilient Strategies",
    description: 'Understand economic trends across the Asia-Pacific region and how to build resilient business and investment strategies.',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    freeOrPaid: true,
    amount: 59.99,
    level: CourseLevel.Intermediate,
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: (() => {
      // Remove sslmode parameter from connection string - we'll handle SSL via config
      let cleanUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
      cleanUrl = cleanUrl.replace(/[?&]$/, '');
      return cleanUrl;
    })(),
    entities: [UserEntity, CourseEntity],
    synchronize: false,
    ssl: (() => {
      // Only enable SSL when explicitly requested (e.g. production with DATABASE_SSL=true)
      if (process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === '1') {
        return { rejectUnauthorized: false };
      }
      // Default: no SSL (works with local Postgres and servers that don't support SSL)
      return false;
    })(),
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const userRepository = dataSource.getRepository(UserEntity);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@ainexus.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping...');
    } else {
      // Create Admin User
      const adminPassword = await bcrypt.hash('Admin@123', 10);
      const now = new Date();
      const admin = userRepository.create({
        username: 'admin',
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@ainexus.com',
        password: adminPassword,
        role: UserRole.Admin,
        status: UserStatus.Active,
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        resetToken: null,
        resetTokenExpires: null,
        createdAt: now,
        updatedAt: now,
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@ainexus.com');
      console.log('   Password: Admin@123');
    }

    // Check if regular user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'user@ainexus.com' },
    });

    if (existingUser) {
      console.log('Regular user already exists. Skipping...');
    } else {
      // Create Regular User
      const userPassword = await bcrypt.hash('User@123', 10);
      const now = new Date();
      const user = userRepository.create({
        username: 'user',
        firstname: 'Test',
        lastname: 'User',
        email: 'user@ainexus.com',
        password: userPassword,
        role: UserRole.User,
        status: UserStatus.Active,
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        resetToken: null,
        resetTokenExpires: null,
        createdAt: now,
        updatedAt: now,
      });

      await userRepository.save(user);
      console.log('✅ Regular user created successfully');
      console.log('   Email: user@ainexus.com');
      console.log('   Password: User@123');
    }

    // Seed dummy courses if none exist
    const courseRepository = dataSource.getRepository(CourseEntity);
    const existingCount = await courseRepository.count();
    if (existingCount === 0) {
      console.log('\n📚 Seeding dummy courses...');
      for (const data of DUMMY_COURSES) {
        const course = courseRepository.create({
          ...data,
          title: data.title!,
          freeOrPaid: data.freeOrPaid ?? false,
          level: data.level ?? CourseLevel.Beginner,
        });
        await courseRepository.save(course);
      }
      console.log(`✅ ${DUMMY_COURSES.length} dummy courses created.`);
    } else {
      console.log(`\n📚 Courses already exist (${existingCount}). Skipping course seed.`);
    }

    console.log('\n🎉 Seed completed successfully!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

seed();

