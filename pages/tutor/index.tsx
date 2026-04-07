import { FormEvent, useEffect, useState } from 'react';

type Tutor = {
  id: string;
  fullName: string;
  role: string;
  campus: { id: string; slug: string; name: string };
  email: string;
};

type PrintJob = {
  id: string;
  studentName?: string;
  status: string;
  requestedAt: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
};

export default function TutorAppPage() {
  const [email, setEmail] = useState('tutor@success.local');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function hydrate() {
    const meRes = await fetch('/api/v2/auth/me');
    if (!meRes.ok) {
      setTutor(null);
      return;
    }

    const meData = await meRes.json();
    setTutor(meData.tutor);

    const [jobsRes, notificationsRes] = await Promise.all([
      fetch('/api/v2/print-jobs'),
      fetch('/api/v2/notifications'),
    ]);

    if (jobsRes.ok) {
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);
    }

    if (notificationsRes.ok) {
      const notificationsData = await notificationsRes.json();
      setNotifications(notificationsData.notifications || []);
    }
  }

  useEffect(() => {
    hydrate();
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }

      await hydrate();
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch('/api/v2/auth/logout', { method: 'POST' });
    setTutor(null);
    setJobs([]);
    setNotifications([]);
  }

  async function quickPrint() {
    if (!tutor) return;
    setLoading(true);
    await fetch('/api/v2/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: 'Walk-in Student', requestedQty: 1, printerName: 'Front Desk Printer' }),
    });
    await hydrate();
    setLoading(false);
  }

  async function markRead(id: string) {
    await fetch(`/api/v2/notifications/${id}/read`, { method: 'POST' });
    await hydrate();
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Tutor App MVP Shell</h1>
      <p style={{ color: '#4b5563', marginTop: 0 }}>
        This is the first mobile-first shell backed by new `/api/v2/*` endpoints.
      </p>

      {!tutor ? (
        <form onSubmit={login} style={{ display: 'grid', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
          </label>
          <button disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
          {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
        </form>
      ) : (
        <section style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
            <h2 style={{ marginTop: 0 }}>Today</h2>
            <p style={{ margin: '0 0 8px 0' }}>{tutor.fullName} • {tutor.campus.name}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={quickPrint} disabled={loading}>Quick print</button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>Print queue</h3>
            {jobs.length === 0 ? <p>No print jobs yet.</p> : (
              <ul>
                {jobs.map((job) => (
                  <li key={job.id}>
                    {job.studentName || 'Student'} — <strong>{job.status}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>Notifications</h3>
            {notifications.length === 0 ? <p>No notifications yet.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {notifications.map((n) => (
                  <li key={n.id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: 8 }}>
                    <p style={{ margin: 0 }}><strong>{n.title}</strong></p>
                    <p style={{ margin: '4px 0' }}>{n.body}</p>
                    {!n.readAt ? <button onClick={() => markRead(n.id)}>Mark as read</button> : <small>Read</small>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
