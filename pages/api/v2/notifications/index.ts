import type { NextApiRequest, NextApiResponse } from 'next';
import { requireV2Tutor } from '../../../../lib/v2/api-auth';
import { getStore } from '../../../../lib/v2/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const tutor = requireV2Tutor(req, res);
  if (!tutor) return;

  const store = getStore();
  const notifications = store.notifications.filter((n) => n.tutorId === tutor.id);

  return res.status(200).json({ ok: true, notifications });
}
