import { Controller, Get, Param, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { UserRole } from '../user/users.entity';
import { SessionGuard } from '../jwt/session.guard';

@Controller('orders')
@UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(@Res() res: Response) {
    const orders = await this.orderService.findAll();
    return res.status(HttpStatus.OK).json({
      length: orders.length,
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: `#${o.id.slice(0, 8)}`,
        userId: o.userId,
        user: o.user
          ? {
              id: o.user.id,
              name: `${(o.user as any).firstname ?? ''} ${(o.user as any).lastname ?? ''}`.trim() || (o.user as any).email,
              email: (o.user as any).email,
            }
          : null,
        courseIds: o.courseIds.split(',').filter(Boolean),
        items: o.items,
        totalAmount: Number(o.totalAmount),
        currency: o.currency,
        status: o.status,
        paymentStatus: o.paymentStatus,
        wooshpaySessionId: o.wooshpaySessionId,
        clientReferenceId: o.clientReferenceId,
        eventType: o.eventType,
        createdAt: o.createdAt,
      })),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    const order = await this.orderService.findOne(id);
    const user = order.user as any;
    return res.status(HttpStatus.OK).json({
      data: {
        id: order.id,
        orderNumber: `#${order.id.slice(0, 8)}`,
        userId: order.userId,
        customer: user
          ? {
              id: user.id,
              name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.email,
              email: user.email,
            }
          : null,
        courseIds: order.courseIds.split(',').filter(Boolean),
        items: order.items,
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        wooshpaySessionId: order.wooshpaySessionId,
        wooshpayPaymentIntentId: order.wooshpayPaymentIntentId,
        clientReferenceId: order.clientReferenceId,
        eventType: order.eventType,
        createdAt: order.createdAt,
      },
    });
  }
}
