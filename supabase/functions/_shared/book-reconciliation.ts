import { BOOK_STORE, UUID } from './book-payments.ts';

type MoneyTotals = { paid_orders: number; gross_minor: number; refunded_minor: number; net_minor: number };
type Order = Record<string, any>;
const minor = (value: unknown): number => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error('Invalid provider amount');
  return value as number;
};
const object = (value: any) => value && typeof value === 'object' ? value : null;

// Compare provider facts with the signed-event ledger. A read-only comparison
// must never silently repair orders or authorize delivery.
export function reconcileBookSessions(sessions: Order[], orders: Order[], isLive: boolean) {
  const byId = new Map(orders.map(order => [order.id, order]));
  const byCurrency: Record<string, MoneyTotals> = {};
  const rows: Order[] = [];
  let outsideStore = 0;
  for (const session of sessions) {
    if (session.livemode !== isLive) throw new Error('Provider mode mismatch');
    if (session.metadata?.store !== BOOK_STORE) { outsideStore++; continue; }
    const issues: string[] = [];
    const orderId = session.metadata.order_id;
    const order = typeof orderId === 'string' && UUID.test(orderId) ? byId.get(orderId) : null;
    const pi = object(session.payment_intent);
    const charge = object(pi?.latest_charge);
    if (session.payment_intent && !pi) throw new Error('PaymentIntent expansion required');
    if (pi?.latest_charge && !charge) throw new Error('Charge expansion required');
    const currency = session.currency;
    if (typeof currency !== 'string' || !/^[a-z]{3}$/.test(currency)) throw new Error('Invalid provider currency');
    const total = minor(session.amount_total);
    const paid = pi ? minor(pi.amount_received) : 0;
    const refunded = charge ? minor(charge.amount_refunded) : 0;
    if (refunded > paid || (pi && (pi.currency !== currency || pi.livemode !== isLive))
      || (charge && (charge.currency !== currency || charge.livemode !== isLive))) throw new Error('Inconsistent provider payment');
    if (!order) issues.push('missing_order');
    else {
      if (order.livemode !== isLive) issues.push('mode');
      if (order.stripe_session_id !== session.id) issues.push('session');
      if (order.currency !== currency) issues.push('currency');
      if (order.format !== session.metadata.format) issues.push('format');
      if (order.expected_amount !== total) issues.push('amount_total');
      if (order.amount_paid !== paid) issues.push('amount_paid');
      if (order.amount_refunded !== refunded) issues.push('amount_refunded');
      if (paid > 0 && order.stripe_payment_intent_id !== pi?.id) issues.push('payment_intent');
      if (paid > 0 && order.payment_status !== (refunded === paid ? 'refunded' : refunded > 0 ? 'partially_refunded' : 'paid')) issues.push('payment_status');
      if (!paid && session.status === 'expired' && order.payment_status !== 'expired') issues.push('payment_status');
      if (!paid && pi?.status === 'processing' && order.payment_status !== 'pending') issues.push('payment_status');
      if (!paid && order.amount_paid > 0) issues.push('unverified_payment');
    }
    byCurrency[currency] ??= { paid_orders: 0, gross_minor: 0, refunded_minor: 0, net_minor: 0 };
    const totals = byCurrency[currency];
    totals.paid_orders += paid > 0 ? 1 : 0;
    totals.gross_minor += paid; totals.refunded_minor += refunded; totals.net_minor += paid - refunded;
    // Settlement currency can differ from sale currency. Keep Stripe's charge
    // transaction separately; it excludes subsequent refund transactions.
    const balance = object(charge?.balance_transaction);
    rows.push({ order_id: typeof orderId === 'string' ? orderId : null, session_id: session.id,
      created: session.created, currency, amount_total: total, amount_paid: paid, amount_refunded: refunded,
      payment_status: session.payment_status, intent_status: pi?.status ?? null, issues,
      ledger_paid: order?.amount_paid ?? null, ledger_refunded: order?.amount_refunded ?? null,
      charge_transaction: balance ? { id: balance.id, currency: balance.currency, amount_minor: balance.amount,
        fee_minor: balance.fee, net_minor: balance.net, status: balance.status } : null });
  }
  return { rows, by_currency: byCurrency, outside_store: outsideStore,
    matched: rows.filter(row => row.issues.length === 0).length,
    mismatches: rows.filter(row => row.issues.length > 0).length };
}
