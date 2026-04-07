export type PrintJobStatus =
  | 'queued'
  | 'accepted'
  | 'printing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'printer_offline';

export type PrintJob = {
  id: string;
  tutorId: string;
  studentName?: string;
  requestedQty: number;
  printerName?: string;
  status: PrintJobStatus;
  requestedAt: string;
  updatedAt: string;
  timeline: Array<{ status: PrintJobStatus; eventAt: string; error?: string }>;
};

export type Notification = {
  id: string;
  tutorId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
};

type V2MemoryStore = {
  printJobs: PrintJob[];
  notifications: Notification[];
};

const globalForV2 = globalThis as unknown as { __stV2Store?: V2MemoryStore };

function nowIso() {
  return new Date().toISOString();
}

export function getStore() {
  if (!globalForV2.__stV2Store) {
    globalForV2.__stV2Store = { printJobs: [], notifications: [] };
  }
  return globalForV2.__stV2Store;
}

export function createPrintJob(input: {
  tutorId: string;
  studentName?: string;
  requestedQty?: number;
  printerName?: string;
}) {
  const store = getStore();
  const timestamp = nowIso();
  const job: PrintJob = {
    id: `pj_${Math.random().toString(36).slice(2, 10)}`,
    tutorId: input.tutorId,
    studentName: input.studentName,
    requestedQty: Math.max(1, input.requestedQty || 1),
    printerName: input.printerName,
    status: 'queued',
    requestedAt: timestamp,
    updatedAt: timestamp,
    timeline: [{ status: 'queued', eventAt: timestamp }],
  };

  store.printJobs.unshift(job);
  pushNotification({
    tutorId: input.tutorId,
    type: 'print_queued',
    title: 'Print queued',
    body: `${input.studentName || 'Student'} print request queued.`,
  });

  return job;
}

export function updatePrintJobStatus(jobId: string, status: PrintJobStatus, error?: string) {
  const store = getStore();
  const job = store.printJobs.find((item) => item.id === jobId);
  if (!job) return undefined;

  const timestamp = nowIso();
  job.status = status;
  job.updatedAt = timestamp;
  job.timeline.unshift({ status, eventAt: timestamp, error });

  if (status === 'completed' || status === 'failed' || status === 'printer_offline') {
    pushNotification({
      tutorId: job.tutorId,
      type: `print_${status}`,
      title: status === 'completed' ? 'Print complete' : 'Print issue',
      body:
        status === 'completed'
          ? `${job.studentName || 'Student'} print finished.`
          : `${job.studentName || 'Student'} print ${status.replace('_', ' ')}${error ? `: ${error}` : ''}.`,
    });
  }

  return job;
}

export function pushNotification(input: { tutorId: string; type: string; title: string; body: string }) {
  const store = getStore();
  const item: Notification = {
    id: `ntf_${Math.random().toString(36).slice(2, 10)}`,
    tutorId: input.tutorId,
    type: input.type,
    title: input.title,
    body: input.body,
    createdAt: nowIso(),
  };
  store.notifications.unshift(item);
  return item;
}
