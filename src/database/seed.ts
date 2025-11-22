import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole, UserStatus } from '../user/users.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [UserEntity],
    synchronize: false,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
      rejectUnauthorized: false,
    },
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
      const admin = userRepository.create({
        username: 'admin',
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@ainexus.com',
        password: adminPassword,
        role: UserRole.Admin,
        status: UserStatus.Active,
        isVerified: true,
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
      const user = userRepository.create({
        username: 'user',
        firstname: 'Test',
        lastname: 'User',
        email: 'user@ainexus.com',
        password: userPassword,
        role: UserRole.User,
        status: UserStatus.Active,
        isVerified: true,
      });

      await userRepository.save(user);
      console.log('✅ Regular user created successfully');
      console.log('   Email: user@ainexus.com');
      console.log('   Password: User@123');
    }

    console.log('\n🎉 Seed completed successfully!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();

