import type { NextApiRequest, NextApiResponse } from 'next';
import { requireV2Tutor } from '../../../../lib/v2/api-auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const tutor = requireV2Tutor(req, res);
  if (!tutor) return;

  return res.status(200).json({
    ok: true,
    tutor: {
      id: tutor.id,
      fullName: tutor.fullName,
      role: tutor.role,
      campus: tutor.campus,
      email: tutor.email,
    },
  });
}
