import { Controller, Post, Body, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { WooshPayService } from './wooshpay.service';
import { CreateCheckoutDto } from './create-checkout.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { CourseEnrollmentService } from '../course/course-enrollment.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly wooshPayService: WooshPayService,
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
    }

    if (!dto.items?.length) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Cart is empty' });
    }

    const currency = (dto.currency || 'USD').toUpperCase();
    const line_items = dto.items.map((item) => ({
      price_data: {
        currency,
        // WooshPay: amount in smallest unit (e.g. cents for USD)
        unit_amount: Math.round((Number(item.price) || 0) * 100),
        product_data: {
          name: item.name || 'Course',
          description: `Course purchase`,
        },
      },
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    const courseIds = dto.items.map((i) => i.id).filter(Boolean);
    // Simple string for WooshPay (many APIs reject JSON in client_reference_id). Format: userId|courseId1,courseId2
    const clientReference = `${userId}|${courseIds.join(',')}`;

    const successUrl = dto.successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3030'}/product/checkout/success`;
    const cancelUrl = dto.cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3030'}/product/checkout`;
    // Some gateways reject localhost; use test URLs when redirect URLs are localhost (for debugging 500)
    const useTestUrls = successUrl.includes('localhost') || cancelUrl.includes('localhost');
    const finalSuccessUrl = useTestUrls ? 'https://example.com/success' : successUrl;
    const finalCancelUrl = useTestUrls ? 'https://example.com/cancel' : cancelUrl;

    try {
      const session = await this.wooshPayService.createCheckoutSession({
        line_items,
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        client_reference_id: clientReference,
      });

      return res.status(HttpStatus.OK).json({
        url: session.url,
        sessionId: session.id,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to create checkout session';
      console.error('WooshPay create-checkout error:', msg);

      const isWooshPay5xx = typeof msg === 'string' && (msg.includes('500') || msg.includes('temporary problem'));
      const showRealError = process.env.PAYMENT_DEBUG !== 'false';
      const userMessage = isWooshPay5xx && !showRealError
        ? 'Payment service is temporarily unavailable. Please try again in a few minutes.'
        : msg;
      const status = isWooshPay5xx && !showRealError ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: userMessage });
    }
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = (req as any).rawBody ?? JSON.stringify(req.body);
    const signatureHeader = req.headers['signature'] ?? req.headers['Signature'];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();

    if (webhookSecret) {
      const verified = this.verifyWooshPaySignature(rawBody, String(signatureHeader || ''), webhookSecret);
      if (!verified) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Webhook signature verification failed' });
      }
    }

    let event: { type?: string; data?: { object?: { client_reference_id?: string; payment_status?: string } } };
    try {
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid JSON');
    }

    if (event.type === 'payment_intent.succeeded' || event?.data?.object?.payment_status === 'paid') {
      const clientRef = event.data?.object?.client_reference_id;
      if (clientRef) {
        try {
          // Format: userId|courseId1,courseId2
          const pipe = clientRef.indexOf('|');
          if (pipe !== -1) {
            const userId = clientRef.slice(0, pipe).trim();
            const courseIds = clientRef.slice(pipe + 1).split(',').map((id) => id.trim()).filter(Boolean);
            if (userId && courseIds.length > 0) {
              await this.courseEnrollmentService.enrollMany(userId, courseIds);
            }
          } else {
            const { userId, courseIds } = JSON.parse(clientRef);
            if (userId && Array.isArray(courseIds) && courseIds.length > 0) {
              await this.courseEnrollmentService.enrollMany(userId, courseIds);
            }
          }
        } catch (e) {
          console.error('Webhook enroll failed:', e);
        }
      }
    }

    return res.status(HttpStatus.OK).json({ received: true });
  }

  /**
   * Verify WooshPay webhook signature (Signature: t=timestamp,v1=hexdigest).
   * signed_payload = timestamp + '.' + rawBody; compare HMAC-SHA256(signed_payload, secret) with v1.
   */
  private verifyWooshPaySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    if (!signatureHeader) return false;
    const parts = signatureHeader.split(',');
    let t = '';
    let v1 = '';
    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === 't') t = val || '';
      if (key === 'v1') v1 = val || '';
    }
    if (!t || !v1) return false;
    const signedPayload = `${t}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }
}
