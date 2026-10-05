// Database authorization checks the current role, active session and verified MFA.
// Never authorize from user_metadata, a decoded JWT alone, or mere membership.
export async function requireAdmin(client: any, permission: string): Promise<Response | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await client.rpc('admin_authorize', { required_permission: permission });
  if (access.error || access.data !== true) {
    return Response.json({ error: 'Forbidden: permission and verified MFA required' }, { status: 403 });
  }
  return null;
}
