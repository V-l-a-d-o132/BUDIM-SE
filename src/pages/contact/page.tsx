import { Link } from 'react-router-dom';
import PageLayout, { PageIntro } from '@/components/feature/PageLayout';
import PartnershipForm from '@/components/feature/PartnershipForm';
import { usePageSeo } from '@/hooks/usePageSeo';

export default function ContactPage() {
  usePageSeo({ title: 'Контакт и запитвания за обучения', description: 'Свържи се с БУДИМ СЕ за пилотно занимание по медийна и дигитална грамотност, въпрос по материалите или предложение за корекция.', canonical: '/contact', schemaType: 'ContactPage' });
  return <PageLayout><PageIntro eyebrow="Контакт" title="Да започнем с един разговор."><p>Пиши ни за занимание с ученици, полезен материал или въпрос по темите на центъра. Ако откриеш неточност, изпрати страницата и източника, с който я сравняваш.</p></PageIntro>
    <div className="site-container contact-grid"><section><h2>Директна връзка</h2><a className="text-link break-all" href="mailto:budimseonline@gmail.com">budimseonline@gmail.com</a><p className="mt-5">За училищно занимание опиши възрастта на участниците, темата и удобния период. Ще уточним формата и условията след преглед на запитването.</p><Link className="text-link" to="/obucheniya-za-uchilishta">Как изглежда примерният учебен час</Link><div className="callout"><p>Не е нужно да изпращаш списъци с ученици, пароли или лична кореспонденция. Кратко описание на въпроса е достатъчно.</p></div></section><PartnershipForm /></div>
  </PageLayout>;
}
