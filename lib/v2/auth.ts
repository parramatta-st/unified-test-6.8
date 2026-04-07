import type { NextApiRequest } from 'next';

export type V2Tutor = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'tutor' | 'manager' | 'admin';
  campus: {
    id: string;
    slug: string;
    name: string;
  };
};

const fallbackTutors: V2Tutor[] = [
  {
    id: 'tutor_demo_1',
    email: 'tutor@success.local',
    password: 'demo1234',
    fullName: 'Demo Tutor',
    role: 'tutor',
    campus: { id: 'campus_parra', slug: 'parramatta', name: 'Parramatta' },
  },
];

function parseTutorsFromEnv() {
  const raw = process.env.V2_TUTOR_ACCOUNTS_JSON;
  if (!raw) return fallbackTutors;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallbackTutors;
    return parsed as V2Tutor[];
  } catch {
    return fallbackTutors;
  }
}

export function findTutorByCredentials(email: string, password: string): V2Tutor | undefined {
  const tutors = parseTutorsFromEnv();
  return tutors.find((t) => t.email.toLowerCase() === email.toLowerCase() && t.password === password);
}

export function findTutorById(id: string): V2Tutor | undefined {
  return parseTutorsFromEnv().find((t) => t.id === id);
}

export function getV2SessionTutorId(req: NextApiRequest): string | undefined {
  const raw = req.cookies['st_v2_auth'];
  if (!raw) return undefined;

  const [prefix, tutorId] = raw.split(':');
  if (prefix !== 'v2' || !tutorId) return undefined;
  return tutorId;
}
