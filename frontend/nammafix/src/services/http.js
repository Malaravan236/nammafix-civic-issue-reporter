const BASE = (import.meta.env.VITE_API || '').replace(/\/+$/, '');

export const tokens = {
  get access() {
    return localStorage.getItem('access');
  },
  get refresh() {
    return localStorage.getItem('refresh');
  },
  set(access, refresh) {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
  },
  clear() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },
};

function send(path, { body, headers = {}, auth = true, ...rest } = {}) {
  const h = { ...headers };

  if (auth && tokens.access) {
    h.Authorization = `Bearer ${tokens.access}`;
  }

  let payload = body;
  if (body && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const url = `${BASE}/${path.replace(/^\/+/, '')}`;

  return fetch(url, {
    ...rest,
    headers: h,
    ...(payload !== undefined ? { body: payload } : {}),
  });
}

async function refreshAccess() {
  if (!tokens.refresh) return false;

  try {
    const res = await fetch(`${BASE}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (!data.access) return false;

    // refresh token rotate aana puthu refresh-um save aagum
    tokens.set(data.access, data.refresh);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

function errorMessage(data, status) {
  if (!data || typeof data !== 'object') return `Request failed (${status})`;

  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.msg === 'string') return data.msg;
  if (typeof data.error === 'string') return data.error;

  const parts = Object.entries(data).flatMap(([key, val]) => {
    const items = Array.isArray(val) ? val : [val];
    return items.map((v) => (typeof v === 'string' ? `${key}: ${v}` : `${key}: ${JSON.stringify(v)}`));
  });

  return parts.length ? parts.join(' ') : `Request failed (${status})`;
}

export async function http(path, opts = {}) {
  let res = await send(path, opts);

  if (res.status === 401 && opts.auth !== false && tokens.access) {
    const refreshed = await refreshAccess();

    if (refreshed) {
      res = await send(path, opts);
    } else {
      tokens.clear();
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired. Please login again.');
    }
  }

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = null;
  }

  if (res.ok && data === null) {
    throw new Error('Server did not return JSON.');
  }

  if (data === null) data = {};

  if (res.status === 429) {
    throw new Error('Too many requests. Wait a minute and try again.');
  }

  if (!res.ok) {
    throw new Error(errorMessage(data, res.status));
  }

  return data;
}