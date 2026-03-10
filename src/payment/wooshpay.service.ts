import { Injectable } from '@nestjs/common';

const WOOSHPAY_API_TEST = 'https://apitest.wooshpay.com';
const WOOSHPAY_API_LIVE = 'https://api.wooshpay.com';

export interface CreateCheckoutLineItem {
  price_data: {
    currency: string;
    unit_amount: number; // in smallest unit (e.g. cents)
    product_data: {
      name: string;
      description?: string;
    };
  };
  quantity: number;
}

export interface CreateCheckoutParams {
  line_items: CreateCheckoutLineItem[];
  success_url: string;
  cancel_url: string;
  mode?: string;
  client_reference_id?: string;
}

export interface WooshPayCheckoutSession {
  id: string;
  url: string;
  status?: string;
  payment_status?: string;
  client_secret?: string;
}

@Injectable()
export class WooshPayService {
  private getSecretKey(): string {
    const raw = process.env.PAYMENT_SECRET_KEY;
    if (!raw || typeof raw !== 'string') {
      throw new Error('PAYMENT_SECRET_KEY is not set in environment');
    }
    const secret = raw.trim();
    if (!secret) {
      throw new Error('PAYMENT_SECRET_KEY is empty');
    }
    if (secret.startsWith('pk_test_') || secret.startsWith('pk_live_')) {
      throw new Error(
        'PAYMENT_SECRET_KEY must be a secret key (sk_test_ or sk_live_). You appear to have set the public key (pk_). Get the secret key from WooshPay Dashboard → API Keys.'
      );
    }
    if (!secret.startsWith('sk_test_') && !secret.startsWith('sk_live_')) {
      throw new Error(
        'PAYMENT_SECRET_KEY should start with sk_test_ (test) or sk_live_ (live). Check WooshPay Dashboard → API Keys.'
      );
    }
    return secret;
  }

  private getBaseUrl(): string {
    const secret = process.env.PAYMENT_SECRET_KEY?.trim() || '';
    return secret.startsWith('sk_live_') ? WOOSHPAY_API_LIVE : WOOSHPAY_API_TEST;
  }

  private getAuthHeader(): string {
    const secret = this.getSecretKey();
    // WooshPay: Basic auth with secret as username, empty password. See https://docs.wooshpay.com/doc-1763752
    const encoded = Buffer.from(`${secret}:`, 'utf-8').toString('base64');
    return `Basic ${encoded}`;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<WooshPayCheckoutSession> {
    const baseUrl = this.getBaseUrl();
    const auth = this.getAuthHeader();

    const body = {
      mode: params.mode || 'payment',
      success_url: params.success_url,
      cancel_url: params.cancel_url,
      line_items: params.line_items,
      ...(params.client_reference_id && { client_reference_id: params.client_reference_id }),
    };

    const wooshPayUrl = `${baseUrl}/v1/checkout/sessions`;
    console.log('[WooshPay] API call:', wooshPayUrl);
    console.log('[WooshPay] Request body:', JSON.stringify(body, null, 2));

    const res = await fetch(wooshPayUrl, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.log('[WooshPay] Error response status:', res.status, '| body:', text.substring(0, 200));
      // Avoid leaking any credential-like values from upstream error messages.
      let safeText = text;
      try {
        const parsed = JSON.parse(text) as any;
        const msg = parsed?.message ?? parsed?.error?.message;
        if (typeof msg === 'string') {
          safeText = msg;
        }
      } catch {
        // keep original text
      }
      // WooshPay: remove key/base64 from error message so we never leak it to the client
      safeText = safeText.replace(/Invalid API Key provided.?.*$/gi, 'Invalid API Key provided.');

      throw new Error(`WooshPay create checkout failed: ${res.status} ${safeText}`);
    }

    const data = (await res.json()) as WooshPayCheckoutSession & { url?: string };
    console.log('[WooshPay] Response status:', res.status, '| session id:', data.id);
    if (!data.url) {
      throw new Error('WooshPay did not return a checkout URL');
    }
    return {
      id: data.id,
      url: data.url,
      status: data.status,
      payment_status: data.payment_status,
      client_secret: data.client_secret,
    };
  }
}
