import { useEffect, useState } from 'react';
export default function RouteLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setSlow(true), 8000); return () => window.clearTimeout(timer); }, []);
  return <main id="main-content" className="route-loading" aria-busy="true">
    <p role="status">{slow ? 'Зареждането отнема повече време. Провери връзката си.' : 'Зареждане на страницата…'}</p>
    {slow && <button className="button-secondary" onClick={() => window.location.reload()}>Опитай отново</button>}
  </main>;
}
