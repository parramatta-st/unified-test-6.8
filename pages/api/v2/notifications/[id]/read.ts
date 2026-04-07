import type { NextApiRequest, NextApiResponse } from 'next';
import { requireV2Tutor } from '../../../../../lib/v2/api-auth';
import { getStore } from '../../../../../lib/v2/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const tutor = requireV2Tutor(req, res);
  if (!tutor) return;

  const id = req.query.id as string;
  const store = getStore();
  const notification = store.notifications.find((n) => n.id === id && n.tutorId === tutor.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'Notification not found' });

  notification.readAt = new Date().toISOString();
  return res.status(200).json({ ok: true, notification });
}
