export type BookFormat = 'physical' | 'digital';
export interface BookStore {
  livemode: boolean; currency: 'eur'; prices: Record<BookFormat, number>;
  physical_available: boolean; digital_available: boolean; edition: { id: string; label: string } | null;
}
export interface BookOrder {
  id: string; format: BookFormat; quantity: number; currency: 'eur';
  amount_total: number; amount_paid: number; amount_refunded: number;
  payment_status: string; fulfillment_status: string; livemode: boolean;
  shipping_carrier: string | null; tracking_number: string | null;
  created_at: string; paid_at: string | null; downloadable: boolean;
}
export const euro = (minor: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(minor / 100);
export const paymentLabels: Record<string, string> = { created: 'Очаква плащане', pending: 'Плащането се обработва', paid: 'Платена', failed: 'Неуспешно плащане', expired: 'Платежната сесия е изтекла', partially_refunded: 'Частично възстановена сума', refunded: 'Възстановена сума' };
export const deliveryLabels: Record<string, string> = { awaiting_payment: 'Очаква потвърдено плащане', ready: 'Очаква подготовка', preparing: 'Подготвя се', shipped: 'Изпратена', delivered: 'Доставена', available: 'Достъпна за изтегляне', downloaded: 'Издаден линк за изтегляне', cancelled: 'Отменена' };

export class BookApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly orderId?: string;
  constructor(message: string, status: number, code?: string, orderId?: string) {
    super(message);
    this.name = 'BookApiError';
    this.status = status; this.code = code; this.orderId = orderId;
  }
}

export function savedOrderForAttempt(token: string): string | null {
  // Older purchase attempts did not include their order ID. The capability
  // stored before redirecting can still identify that buyer's own order.
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const key = sessionStorage.key(index);
      if (key && /^book-order:[a-f0-9-]{36}$/i.test(key) && sessionStorage.getItem(key) === token) return key.slice(11);
    }
  } catch { /* An unavailable capability is handled without starting another payment. */ }
  return null;
}

export async function bookApi(name: string, body?: Record<string, unknown>, accessToken?: string) {
  const key = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
  const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/${name}`, {
    method: body ? 'POST' : 'GET', cache: 'no-store', signal: AbortSignal.timeout(60000),
    headers: { 'Content-Type': 'application/json', apikey: key, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new BookApiError(
    typeof result.error === 'string' ? result.error : 'Заявката временно не е достъпна.',
    response.status,
    typeof result.code === 'string' ? result.code : undefined,
    typeof result.order_id === 'string' && /^[a-f0-9-]{36}$/i.test(result.order_id) ? result.order_id : undefined,
  );
  return result;
}

export function orderAccess(id: string): string | null {
  try { return sessionStorage.getItem(`book-order:${id}`); } catch { return null; }
}
export function privateOrderLink(id: string, token: string): string {
  return `${window.location.origin}/order?order=${encodeURIComponent(id)}#access=${token}`;
}
