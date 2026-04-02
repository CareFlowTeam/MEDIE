const API_BASE = 'http://20.106.40.121';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || '요청에 실패했습니다.');
  }

  return data;
}

export async function createPillSchedule(payload) {
  const response = await fetch(`${API_BASE}/pill-schedules/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getPillSchedules(userId) {
  const response = await fetch(`${API_BASE}/pill-schedules/${userId}`);
  return handleResponse(response);
}

export async function updatePillSchedule(itemId, userId, payload) {
  const response = await fetch(`${API_BASE}/pill-schedules/${itemId}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deletePillSchedule(itemId, userId) {
  const response = await fetch(`${API_BASE}/pill-schedules/${itemId}/${userId}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}

export async function deletePillSchedulesByPill(pillId, userId) {
  const response = await fetch(`${API_BASE}/pill-schedules/pill/${pillId}/${userId}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}