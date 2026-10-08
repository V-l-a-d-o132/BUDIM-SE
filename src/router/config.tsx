import { lazy } from 'react';
import { type RouteObject, Navigate } from 'react-router-dom';
const NewsListPage = lazy(() => import('../pages/news/page').then(m => ({ default: m.NewsListPage })));
const NewsDetailPage = lazy(() => import('../pages/news/page').then(m => ({ default: m.NewsDetailPage })));
const StudentsPage = lazy(() => import('../pages/mediyna-gramotnost-uchenici/page'));
const SchoolsPage = lazy(() => import('../pages/obucheniya-za-uchilishta/page'));
const ResourcesPage = lazy(() => import('../pages/resursi/page'));

const HomePage = lazy(() => import('../pages/home/page'));
const Step1Page = lazy(() => import('../pages/step1/page'));
const Step2Page = lazy(() => import('../pages/step2/page'));
const Step3Page = lazy(() => import('../pages/step3/page'));
const Step4Page = lazy(() => import('../pages/step4/page'));
const Step5Page = lazy(() => import('../pages/step5/page'));
const OrderPage = lazy(() => import('../pages/order/page'));
const AuthorPage = lazy(() => import('../pages/author/page'));
const TavoraShieldPage = lazy(() => import('../pages/tavora-shield/page'));
const CenterPage = lazy(() => import('../pages/center/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const TermsPage = lazy(() => import('../pages/terms/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const TestimonialsPage = lazy(() => import('../pages/testimonials/page'));
const SourcesPage = lazy(() => import('../pages/sources/page'));
const DigitalnaGramotnostPage = lazy(() => import('../pages/digitalna-gramotnost/page'));

// Admin pages
const AdminMfaPage = lazy(() => import('../pages/admin/mfa/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin/page'));
const AdminInquiriesPage = lazy(() => import('../pages/admin/inquiries/page'));
const AdminOrdersPage = lazy(() => import('../pages/admin/orders/page'));
const AdminNewsPage = lazy(() => import('../pages/admin/news/page'));
const AdminSocialPostsPage = lazy(() => import('../pages/admin/social-posts/page'));
const AdminCommentsPage = lazy(() => import('../pages/admin/comments/page'));
const AdminClassroomsPage = lazy(() => import('../pages/admin/classrooms/page'));

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/step-1', element: <Step1Page /> },
  { path: '/step-2', element: <Step2Page /> },
  { path: '/step-3', element: <Step3Page /> },
  { path: '/step-4', element: <Step4Page /> },
  { path: '/step-5', element: <Step5Page /> },
  { path: '/order', element: <OrderPage /> },
  { path: '/author', element: <AuthorPage /> },
  { path: '/analizator', element: <TavoraShieldPage /> },
  { path: '/tavora-shield', element: <Navigate to="/analizator" replace /> },
  { path: '/center', element: <CenterPage /> },
  { path: '/resursi', element: <ResourcesPage /> },
  { path: '/news', element: <NewsListPage /> },
  { path: '/news/:slug', element: <NewsDetailPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/testimonials', element: <TestimonialsPage /> },
  { path: '/sources', element: <SourcesPage /> },
  { path: '/digitalna-gramotnost', element: <DigitalnaGramotnostPage /> },
  { path: '/mediyna-gramotnost-uchenici', element: <StudentsPage /> },
  { path: '/obucheniya-za-uchilishta', element: <SchoolsPage /> },
  // Admin
  { path: '/admin/mfa', element: <AdminMfaPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin', element: <AdminDashboardPage /> },
  { path: '/admin/inquiries', element: <AdminInquiriesPage /> },
  { path: '/admin/orders', element: <AdminOrdersPage /> },
  { path: '/admin/news', element: <AdminNewsPage /> },
  { path: '/admin/social-posts', element: <AdminSocialPostsPage /> },
  { path: '/admin/comments', element: <AdminCommentsPage /> },
  { path: '/admin/classrooms', element: <AdminClassroomsPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default routes;

