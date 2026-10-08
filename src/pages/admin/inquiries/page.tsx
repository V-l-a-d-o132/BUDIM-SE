import LegacyIcon from '@/components/base/LegacyIcon';
import { useEffect, useState } from 'react';
import AdminGuard from '@/pages/admin/components/AdminGuard';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

interface Inquiry {
  id: string;
  organization: string;
  type: string;
  email: string;
  message: string | null;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  school: 'Училище',
  ngo: 'НПО',
  corporate: 'Бизнес',
  media: 'Медия',
  other: 'Друго',
};

export default function AdminInquiries() {
  usePageSeo({
    title: 'Администрация — Запитвания',
    description: 'Административен панел — запитвания за партньорство.',
    noIndex: true,
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  useEffect(() => {
    supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInquiries((data as Inquiry[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <AdminGuard>
      <AdminLayout title="Запитвания за партньорство">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LegacyIcon className="ri-loader-4-line animate-spin text-gray-300 text-3xl"></LegacyIcon>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <LegacyIcon className="ri-mail-line text-4xl mb-3 block"></LegacyIcon>
              <p className="text-sm">Няма запитвания все още.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* List */}
              <div className="lg:col-span-2 space-y-2">
                {inquiries.map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => setSelected(inq)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selected?.id === inq.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-100 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-medium truncate ${selected?.id === inq.id ? 'text-white' : 'text-gray-900'}`}>
                        {inq.organization}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                        selected?.id === inq.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {typeLabels[inq.type] ?? inq.type}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${selected?.id === inq.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {inq.email}
                    </p>
                    <p className={`text-xs mt-1 ${selected?.id === inq.id ? 'text-gray-400' : 'text-gray-300'}`}>
                      {new Date(inq.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </button>
                ))}
              </div>

              {/* Detail */}
              <div className="lg:col-span-3">
                {selected ? (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">{selected.organization}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {new Date(selected.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full whitespace-nowrap">
                        {typeLabels[selected.type] ?? selected.type}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Имейл</p>
                        <a href={`mailto:${selected.email}`} className="text-sm text-gray-900 hover:underline">
                          {selected.email}
                        </a>
                      </div>
                      {selected.message && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Съобщение</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <a
                        href={`mailto:${selected.email}?subject=Re: Запитване от ${selected.organization}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <LegacyIcon className="ri-reply-line"></LegacyIcon>
                        Отговори по имейл
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400">
                    <LegacyIcon className="ri-mail-open-line text-3xl mb-2 block"></LegacyIcon>
                    <p className="text-sm">Избери запитване от списъка</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}