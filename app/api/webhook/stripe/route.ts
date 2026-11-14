import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPaymentThanksEmail } from '@/lib/mailer';
import { updateUserSubscription } from '@/lib/auth';

/**
 * Stripe Webhook ハンドラー
 * POST /api/webhook/stripe
 * 
 * イベント処理:
 * - checkout.session.completed: 決済完了時にサンクスメール自動送信 & ユーザーの有料フラグ更新
 * - customer.subscription.deleted: 解約時
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const bodyText = await req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } else {
      // webhookSecret未設定時（開発環境など）
      event = JSON.parse(bodyText) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // イベント種別ごとの処理
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email || (typeof session.customer_email === 'string' ? session.customer_email : undefined);
      const customerName = session.customer_details?.name || session.metadata?.userName || 'お客様';
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

      console.log(`🎉 Checkout completed for: ${customerEmail} (Customer ID: ${customerId})`);

      // ユーザーアカウント情報の購読ステータス更新
      if (customerEmail) {
        updateUserSubscription(customerEmail, {
          isPremium: true,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kokoronavi.dev';

        // サンクスメール自動送信
        await sendPaymentThanksEmail({
          toEmail: customerEmail,
          userName: customerName,
          amount: (session.amount_total ? session.amount_total : 980),
          currency: session.currency || 'jpy',
          portalUrl: `${appUrl}/account`,
          reportUrl: `${appUrl}/result`,
        }).catch((err) => console.error('Failed to send thanks email:', err));
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
      console.log(`⚠️ Subscription canceled for customer: ${customerId}`);
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
