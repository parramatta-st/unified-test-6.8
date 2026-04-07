import type { NextApiRequest, NextApiResponse } from 'next';
import { requireV2Tutor } from '../../../../../lib/v2/api-auth';
import { getStore } from '../../../../../lib/v2/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const tutor = requireV2Tutor(req, res);
  if (!tutor) return;

  const id = req.query.id as string;
  const store = getStore();
  const job = store.printJobs.find((item) => item.id === id && item.tutorId === tutor.id);
  if (!job) return res.status(404).json({ ok: false, error: 'Print job not found' });

  return res.status(200).json({ ok: true, printJob: job });
}
