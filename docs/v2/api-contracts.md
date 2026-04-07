# Success Tutoring v2 API Contracts (Draft)

This document defines the first concrete API contracts for the platform upgrade.

## 1) Auth + Tutor Context

### `POST /api/v2/auth/login`
Authenticate an individual tutor account.

**Request**
```json
{
  "email": "tutor@example.com",
  "password": "••••••••",
  "device": {
    "platform": "ios",
    "pushToken": "ExponentPushToken[...]",
    "appVersion": "1.0.0"
  }
}
```

**Response 200**
```json
{
  "ok": true,
  "session": {
    "accessToken": "jwt-or-session-token",
    "expiresAt": "2026-04-07T12:00:00.000Z"
  },
  "tutor": {
    "id": "tutor_123",
    "fullName": "Jane Tutor",
    "role": "tutor",
    "campus": {
      "id": "campus_1",
      "slug": "parramatta",
      "name": "Parramatta"
    }
  }
}
```

### `POST /api/v2/auth/logout`
Revokes the active session and optionally unregisters a device push token.

---

## 2) Print Jobs

### `POST /api/v2/print-jobs`
Creates a durable print job and dispatches it to the Mac print service.

**Request**
```json
{
  "studentId": "student_123",
  "sessionId": "session_456",
  "requestedQty": 2,
  "printerName": "Front Desk Printer",
  "requestType": "topic_print",
  "items": [
    {
      "materialId": "MAT-7A",
      "itemName": "Year 7 Algebra Intro",
      "itemType": "worksheet",
      "path": "Year 7/Math/Algebra/Intro.pdf",
      "sequenceNo": 1
    }
  ],
  "meta": {
    "subject": "Math",
    "year": "Year 7",
    "topic": "Algebra"
  }
}
```

**Response 202**
```json
{
  "ok": true,
  "printJob": {
    "id": "pj_abc123",
    "status": "queued",
    "requestedAt": "2026-04-07T12:05:00.000Z"
  }
}
```

### `GET /api/v2/print-jobs/:id`
Returns job status timeline for app/web UI.

### `GET /api/v2/print-jobs?status=queued&campusId=...`
Admin/operator list view with filters.

---

## 3) Mac Print Service Callback Contract

### `POST /api/v2/print-jobs/:id/status`
Source of truth callback endpoint used by the Mac print service.

Required header:
- `X-PRINT-SIGNATURE`: HMAC signature for payload verification.

**Request**
```json
{
  "status": "printing",
  "eventAt": "2026-04-07T12:06:03.000Z",
  "printerName": "Front Desk Printer",
  "items": [
    {
      "sequenceNo": 1,
      "status": "started"
    }
  ],
  "error": null,
  "raw": {
    "nativeJobId": "MAC-99122"
  }
}
```

**Allowed status values**
- `queued`
- `accepted`
- `printing`
- `completed`
- `failed`
- `cancelled`
- `printer_offline`

**Response 200**
```json
{
  "ok": true
}
```

When terminal status is `completed` or `failed`, the backend publishes notifications to tutor devices.

---

## 4) Notifications

### `GET /api/v2/notifications`
Returns tutor notification inbox.

### `POST /api/v2/notifications/:id/read`
Marks notification as read.

### Event types (initial)
- `print_queued`
- `print_completed`
- `print_failed`
- `printer_offline`
- `student_checked_in`
- `feedback_missing`

---

## 5) Backward Compatibility (v1 portal)

During migration, existing routes stay active:
- `/api/send-feedback`
- `/api/print-proxy`
- `/api/log-print`

The bridge strategy is:
1. Keep current route behavior unchanged for existing staff usage.
2. Add DB writes/event creation in parallel.
3. Flip reads to v2 entities once parity is confirmed.
