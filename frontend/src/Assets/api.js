// ─── Base API URL ──────────────────────────────────────────────────────────────
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

// ─── Sustainability Score API ─────────────────────────────────────────────────

export async function postSustainabilityScore(payload) {
  return apiFetch('/api/sustainability/score', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Eco-Material Recommendations API ─────────────────────────────────────────

export async function postEcoRecommendations(inputs) {
  return apiFetch('/api/recommendations/eco-materials', {
    method: 'POST',
    body: JSON.stringify(inputs),
  });
}

export async function getEcoRules() {
  return apiFetch('/api/recommendations/rules');
}

// ─── Architect Projects API ───────────────────────────────────────────────────

export async function getProjects() {
  return apiFetch('/api/projects');
}

export async function getProject(projectId) {
  return apiFetch(`/api/projects/${encodeURIComponent(projectId)}`);
}

export async function createProject(payload) {
  return apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProject(projectId, updates) {
  return apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteProject(projectId) {
  return apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
  });
}

export async function getProjectAnalytics(projectId) {
  return apiFetch(`/api/projects/${encodeURIComponent(projectId)}/analytics`);
}

// ─── Waste Management API (CPWD / BMTPC / NICMAR) ─────────────────────────────

export async function getWasteThresholds() {
  return apiFetch('/api/waste/thresholds');
}

export async function calculateWaste(materials, projectId = null) {
  return apiFetch('/api/waste/calculate', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, materials }),
  });
}

// ─── Safe Material Reuse API ──────────────────────────────────────────────────

export async function getReuseRules() {
  return apiFetch('/api/recommendations/reuse/rules');
}

export async function getProjectReuse(materialsPresent = null, projectId = null) {
  return apiFetch('/api/recommendations/reuse', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, materials_present: materialsPresent }),
  });
}

// ─── Progress Tracking & Site Images API ──────────────────────────────────────

export async function logProgress(logData) {
  return apiFetch('/api/progress/log', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

export async function getProgressLogs(projectId) {
  return apiFetch(`/api/progress/${encodeURIComponent(projectId)}`);
}

export async function updateStageProgress(projectId, stageId, updates) {
  return apiFetch(`/api/progress/projects/${encodeURIComponent(projectId)}/stages/${stageId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function uploadSiteImage(formData) {
  const url = `${BASE_URL}/api/progress/upload-image`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData, // fetch sets multipart/form-data boundary automatically
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function getSiteImages(projectId) {
  return apiFetch(`/api/progress/images/${encodeURIComponent(projectId)}`);
}
