import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { WooshPayService } from './wooshpay.service';
import { CourseModule } from '../course/courses.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CourseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {},
    }),
  ],
  controllers: [PaymentController],
  providers: [WooshPayService],
})
export class PaymentModule {}
