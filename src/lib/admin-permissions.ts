export type AdminRole = 'super_admin' | 'editor' | 'moderator';
export type AdminPermission = 'access' | 'news' | 'moderate' | 'orders' | 'inquiries' | 'private_data';

export function requiredAdminPermission(path: string): AdminPermission {
  if (path.startsWith('/admin/orders')) return 'orders';
  if (path.startsWith('/admin/inquiries')) return 'inquiries';
  if (path.startsWith('/admin/news')) return 'news';
  if (path.startsWith('/admin/social-posts') || path.startsWith('/admin/comments')) return 'moderate';
  return 'access';
}

export function validAdminRole(role: unknown): role is AdminRole {
  return role === 'super_admin' || role === 'editor' || role === 'moderator';
}
