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

export async function bookApi(name: string, body?: Record<string, unknown>, accessToken?: string) {
  const key = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
  const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/${name}`, {
    method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', apikey: key, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'Заявката временно не е достъпна.');
  return result;
}

export function orderAccess(id: string): string | null {
  return sessionStorage.getItem(`book-order:${id}`);
}
export function privateOrderLink(id: string, token: string): string {
  return `${window.location.origin}/order?order=${encodeURIComponent(id)}#access=${token}`;
}
