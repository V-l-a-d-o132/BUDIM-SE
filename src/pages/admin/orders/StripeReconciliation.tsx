import { useEffect, useRef, useState } from 'react';
import { euro } from '@/lib/book-orders';

interface Totals { paid_orders: number; gross_minor: number; refunded_minor: number; net_minor: number }
interface Row {
  order_id: string | null; session_id: string; currency: string; amount_paid: number; amount_refunded: number;
  ledger_paid: number | null; ledger_refunded: number | null; issues: string[];
  charge_transaction: { currency: string; fee_minor: number; net_minor: number; status: string } | null;
}
interface Report { rows: Row[]; by_currency: Record<string, Totals>; has_more: boolean; next_cursor: string | null; outside_store: number; checked_at: string }
const labels: Record<string,string> = { missing_order:'Липсва записана поръчка',mode:'Различен режим',session:'Различна Checkout сесия',currency:'Различна валута',format:'Различно издание',amount_total:'Различна поръчана сума',amount_paid:'Различна платена сума',amount_refunded:'Различно възстановяване',payment_intent:'Различно плащане',payment_status:'Различен статус',unverified_payment:'Липсва потвърдено плащане в Stripe' };
const money = (amount: number, currency: string) => currency === 'eur' ? euro(amount) : `${amount} ${currency.toUpperCase()} (малки единици)`;

export default function StripeReconciliation({ mode, api }: { mode: boolean | null; api(body: Record<string,unknown>): Promise<any> }) {
  const [report,setReport] = useState<Report | null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const generation = useRef(0);
  useEffect(()=>{ generation.current++; setReport(null); setError(''); setBusy(false); },[mode]);
  const check = async (more = false) => {
    if (mode === null || busy) return;
    const current = generation.current; setBusy(true); setError('');
    try {
      const page: Report = await api({ action:'reconcile', livemode:mode, ...(more && report?.next_cursor ? { starting_after:report.next_cursor } : {}) });
      if (generation.current !== current) return;
      setReport(previous=>{
        if (!more || !previous) return page;
        const totals = structuredClone(previous.by_currency);
        for (const [currency,row] of Object.entries(page.by_currency)) {
          totals[currency] ??= {paid_orders:0,gross_minor:0,refunded_minor:0,net_minor:0};
          for (const key of Object.keys(row) as (keyof Totals)[]) totals[currency][key] += row[key];
        }
        return {...page,rows:[...previous.rows,...page.rows],by_currency:totals,outside_store:previous.outside_store+page.outside_store};
      });
    } catch(err) { if(generation.current===current) setError(err instanceof Error?err.message:'Съпоставката временно не е достъпна.'); }
    finally { if(generation.current===current) setBusy(false); }
  };
  return <section className="bg-white border rounded-xl p-5 space-y-4">
    <h2 className="font-medium text-gray-900">Съпоставка със Stripe</h2>
    <p className="text-sm text-gray-600">Проверява плащанията и възстановяванията от Stripe спрямо записаните поръчки. Сумите са преди платежните такси. Справката не променя поръчките.</p>
    <button type="button" disabled={busy || mode===null} onClick={()=>check()} className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50">{busy?'Проверка…':'Провери в Stripe'}</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {report && <>
      <p role="status" className="text-sm text-gray-700">Проверени {report.rows.length} поръчки · Разминавания: {report.rows.filter(row=>row.issues.length>0).length}. {report.has_more?'Има още страници — сборът още е частичен.':'Всички Checkout сесии в избрания режим са обходени.'}</p>
      {Object.entries(report.by_currency).map(([currency,row])=><p key={currency} className="text-sm text-gray-600">{currency.toUpperCase()}: получени {money(row.gross_minor,currency)} · възстановени {money(row.refunded_minor,currency)} · след възстановявания {money(row.net_minor,currency)}</p>)}
      {report.outside_store>0 && <p className="text-xs text-gray-500">{report.outside_store} сесии извън новата система за книгата са изключени. По-старите продажби се проверяват отделно в Stripe.</p>}
      {report.has_more && <button type="button" disabled={busy} onClick={()=>check(true)} className="border rounded-lg px-4 py-2 text-sm">Провери следващите 50</button>}
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="py-2">Поръчка</th><th>Платено / възстановено</th><th>Проверка</th><th>Такса за плащането</th></tr></thead><tbody>{report.rows.map(row=><tr key={row.session_id} className="border-b align-top"><td className="py-3 pr-3 break-all">{row.order_id??row.session_id}</td><td className="py-3 pr-3 whitespace-nowrap">Stripe: {money(row.amount_paid,row.currency)} / {money(row.amount_refunded,row.currency)}<br/>Сайт: {row.ledger_paid===null?'липсва':money(row.ledger_paid,row.currency)} / {row.ledger_refunded===null?'липсва':money(row.ledger_refunded,row.currency)}</td><td className={`py-3 pr-3 ${row.issues.length?'text-red-700':'text-green-800'}`}>{row.issues.length?row.issues.map(issue=>labels[issue]??issue).join('; '):'Съвпада'}</td><td className="py-3">{row.charge_transaction?money(row.charge_transaction.fee_minor,row.charge_transaction.currency):'—'}</td></tr>)}</tbody></table></div>
      <p className="text-xs text-gray-500">Таксата е от първоначалната транзакция в Stripe и може да е в различна валута. Тя не включва последващи такси или транзакции за възстановяване; това не е справка за банково изплащане. Проверено: {new Date(report.checked_at).toLocaleString('bg-BG')}.</p>
    </>}
  </section>;
}
