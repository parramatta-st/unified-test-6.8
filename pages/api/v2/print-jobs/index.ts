import type { NextApiRequest, NextApiResponse } from 'next';
import { requireV2Tutor } from '../../../../lib/v2/api-auth';
import { createPrintJob, getStore } from '../../../../lib/v2/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tutor = requireV2Tutor(req, res);
  if (!tutor) return;

  if (req.method === 'POST') {
    const { studentName, requestedQty, printerName } = req.body || {};
    const job = createPrintJob({
      tutorId: tutor.id,
      studentName,
      requestedQty: Number(requestedQty || 1),
      printerName,
    });

    return res.status(202).json({ ok: true, printJob: job });
  }

  if (req.method === 'GET') {
    const store = getStore();
    const jobs = store.printJobs.filter((item) => item.tutorId === tutor.id);
    return res.status(200).json({ ok: true, jobs });
  }

  return res.status(405).end();
}
