import type { NextApiRequest, NextApiResponse } from 'next';
import { PrintJobStatus, updatePrintJobStatus } from '../../../../../lib/v2/store';

const allowed: PrintJobStatus[] = ['queued', 'accepted', 'printing', 'completed', 'failed', 'cancelled', 'printer_offline'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const incomingToken = req.headers['x-print-token'];
  const expectedToken = process.env.PRINT_CALLBACK_TOKEN;
  if (expectedToken && incomingToken !== expectedToken) {
    return res.status(401).json({ ok: false, error: 'Invalid callback token' });
  }

  const id = req.query.id as string;
  const { status, error } = req.body || {};
  if (!allowed.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status' });
  }

  const job = updatePrintJobStatus(id, status, error);
  if (!job) return res.status(404).json({ ok: false, error: 'Print job not found' });

  return res.status(200).json({ ok: true, printJob: job });
}
