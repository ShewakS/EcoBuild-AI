// ─── Base API URL ──────────────────────────────────────────────────────────────
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─── Generic fetch helper with JWT & 401 handling ────────────────────────────
export function getAuthToken() {
  return localStorage.getItem('ecobuild_token');
}

export function setAuthSession(token, user) {
  if (token) localStorage.setItem('ecobuild_token', token);
  if (user) localStorage.setItem('ecobuild_user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('ecobuild_token');
  localStorage.removeItem('ecobuild_user');
}

export function getStoredUser() {
  const u = localStorage.getItem('ecobuild_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuthSession();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }
  }

  if (!res.ok) {
    let errMessage = `API error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) errMessage = errJson.detail;
    } catch {
      const errText = await res.text();
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage);
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

// ─── Authentication & User API ───────────────────────────────────────────────

export async function loginUser(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token && data.user) {
    setAuthSession(data.access_token, data.user);
  }
  return data;
}

export async function getMe() {
  return apiFetch('/api/auth/me');
}

export async function logoutUser() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  } finally {
    clearAuthSession();
  }
}

export async function changePassword(oldPassword, newPassword) {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

// ─── Customer Assignment (Architect / Admin) ──────────────────────────────────

export async function assignProjectCustomer(projectId, customerData) {
  return apiFetch(`/api/projects/${encodeURIComponent(projectId)}/customer`, {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

// ─── Super Admin APIs ─────────────────────────────────────────────────────────

export async function getAdminDashboard() {
  return apiFetch('/api/admin/dashboard');
}

export async function getAdminArchitects() {
  return apiFetch('/api/admin/architects');
}

export async function createAdminArchitect(payload) {
  return apiFetch('/api/admin/architects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateArchitectStatus(userId, status) {
  return apiFetch(`/api/admin/architects/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateArchitectPlan(userId, plan) {
  return apiFetch(`/api/admin/architects/${encodeURIComponent(userId)}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ plan }),
  });
}

export async function getAdminProjects() {
  return apiFetch('/api/admin/projects');
}

export async function getAdminCustomers() {
  return apiFetch('/api/admin/customers');
}

export async function getAdminSubscriptions() {
  return apiFetch('/api/admin/subscriptions');
}

export async function getAdminUsage() {
  return apiFetch('/api/admin/usage');
}

// ─── Customer APIs (Read-Only Portal) ─────────────────────────────────────────

export async function getCustomerDashboard() {
  return apiFetch('/api/customer/dashboard');
}

export async function getCustomerProjects() {
  return apiFetch('/api/customer/projects');
}

export async function getCustomerProjectDetail(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}`);
}

export async function getCustomerMaterials(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/materials`);
}

export async function getCustomerCost(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/cost`);
}

export async function getCustomerCarbon(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/carbon`);
}

export async function getCustomerSustainability(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/sustainability`);
}

export async function getCustomerProgress(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/progress`);
}

export async function getCustomerImages(projectId) {
  return apiFetch(`/api/customer/projects/${encodeURIComponent(projectId)}/images`);
}

