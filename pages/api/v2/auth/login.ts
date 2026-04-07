import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { findTutorByCredentials } from '../../../../lib/v2/auth';

function shouldUseSecureCookie(req: NextApiRequest) {
  return req.headers['x-forwarded-proto'] === 'https' || process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Missing email or password' });
  }

  const tutor = findTutorByCredentials(email, password);
  if (!tutor) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const cookie = serialize('st_v2_auth', `v2:${tutor.id}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookie(req),
    maxAge: 60 * 60 * 24 * 7,
  });

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({
    ok: true,
    tutor: {
      id: tutor.id,
      fullName: tutor.fullName,
      role: tutor.role,
      campus: tutor.campus,
    },
  });
}
