// ─── Base API URL ──────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─── Generic fetch helper ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ─── Estimate API ─────────────────────────────────────────────────────────────

export async function postEstimateCost(inputs) {
  return apiFetch('/api/estimate/cost', {
    method: 'POST',
    body: JSON.stringify(inputs),
  });
}

export async function getEstimate(estimateId) {
  return apiFetch(`/api/estimate/${encodeURIComponent(estimateId)}`);
}

// ─── Carbon Emission API (IFC India Dataset) ──────────────────────────────────

export async function getCarbonFactors() {
  return apiFetch('/api/carbon/factors');
}

export async function postEstimateCarbon(inputs) {
  return apiFetch('/api/carbon/estimate', {
    method: 'POST',
    body: JSON.stringify(inputs),
  });
}
