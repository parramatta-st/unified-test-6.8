import type { NextApiRequest, NextApiResponse } from 'next';
import { findTutorById, getV2SessionTutorId } from './auth';

export function requireV2Tutor(req: NextApiRequest, res: NextApiResponse) {
  const tutorId = getV2SessionTutorId(req);
  if (!tutorId) {
    res.status(401).json({ ok: false, error: 'Not authenticated' });
    return;
  }

  const tutor = findTutorById(tutorId);
  if (!tutor) {
    res.status(401).json({ ok: false, error: 'Invalid session' });
    return;
  }

  return tutor;
}
