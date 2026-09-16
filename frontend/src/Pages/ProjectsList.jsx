import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject, updateProject, assignProjectCustomer } from '../Assets/api';
import { TAMIL_NADU_DISTRICTS } from '../Assets/constants';
import { Ruler, Search, ClipboardList, Edit, Trash2, User, MapPin, Building2, X } from 'lucide-react';

export default function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Customer Assignment Modal State
  const [assigningProject, setAssigningProject] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [assigning, setAssigning] = useState(false);


  // Simplified New Project Form State: strictly Name, Client, Location dropdown, Architect
  const [formData, setFormData] = useState({
    project_name: '',
    client_name: '',
    location: 'Chennai',
    architect_name: 'Lead Architect',
  });

  const fetchProjectsList = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Could not load projects. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsList();
  }, []);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.project_name.trim() || !formData.client_name.trim()) {
      alert('Please fill in project name and client name.');
      return;
    }
    try {
      setCreating(true);
      const res = await createProject({
        project_name: formData.project_name.trim(),
        client_name: formData.client_name.trim(),
        location: formData.location,
        architect_name: formData.architect_name.trim() || 'Lead Architect',
      });
      setIsModalOpen(false);
      setFormData({
        project_name: '',
        client_name: '',
        location: 'Chennai',
        architect_name: 'Lead Architect',
      });
      await fetchProjectsList();
      navigate(`/architect/${res.project_id}?tab=prediction`);
    } catch (err) {
      alert('Error creating project: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}" (${projectId})?\n\nThis will permanently remove the project, all milestone progress, and uploaded inspection photos.`)) {
      try {
        await deleteProject(projectId);
        await fetchProjectsList();
      } catch (err) {
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      setSavingEdit(true);
      await updateProject(editingProject.project_id, {
        project_name: editingProject.project_name,
        client_name: editingProject.client_name,
        location: editingProject.location,
        architect_name: editingProject.architect_name,
        status: editingProject.status,
      });
      setEditingProject(null);
      await fetchProjectsList();
    } catch (err) {
      alert('Failed to update project: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssignCustomer = async (e) => {
    e.preventDefault();
    if (!assigningProject || !customerFormData.email) return;
    try {
      setAssigning(true);
      await assignProjectCustomer(assigningProject.project_id, customerFormData);
      alert(`Customer portal assigned to "${assigningProject.project_name}" successfully!\n\nEmail: ${customerFormData.email}\nPassword: ${customerFormData.password}`);
      setAssigningProject(null);
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
      await fetchProjectsList();
    } catch (err) {
      alert('Failed to assign customer: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };


  // Filtered projects
  const filtered = projects.filter(p => {
    const matchesSearch = 
      p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && (p.status?.toLowerCase() === filterStatus.toLowerCase());
  });

  // KPI calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const avgProgress = totalProjects 
    ? Math.round(projects.reduce((acc, p) => acc + (p.overall_progress_percent || 0), 0) / totalProjects) 
    : 0;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header Banner ── */}
      <div 
        className="py-10 px-6 border-b"
        style={{ 
          background: 'linear-gradient(135deg, #1A4D2E 0%, #133E24 100%)',
          color: 'white'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#A3E635' }}>
              <Ruler size={14} /> Architect &amp; Builder Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Construction Projects Workspace
            </h1>
            <p className="text-sm sm:text-base text-gray-200 max-w-2xl">
              Manage construction projects with ML cost &amp; material predictions, room dimensions, CPWD waste benchmarks, embodied carbon, and 11-stage progress monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 text-white"
              style={{ background: 'var(--rust)' }}
              id="new-project-btn"
            >
              <span className="text-lg leading-none">+</span>
              Create New Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500">Total Projects</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--green-deep)' }}>{totalProjects}</span>
              <span className="text-xs text-gray-400">managed</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500">Active Sites</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-blue-600">{activeProjects}</span>
              <span className="text-xs text-gray-400">in progress</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500">Avg Completion</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">{avgProgress}%</span>
              <span className="text-xs text-gray-400">across stages</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by project, client, location, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--green-mid)] bg-white"
            />
            <span className="absolute left-3.5 top-3 text-gray-400 text-sm"><Search size={16} /></span>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border">
            {['all', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterStatus === status 
                    ? 'bg-[var(--green-deep)] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchProjectsList} className="font-bold underline text-xs">Retry</button>
          </div>
        )}

        {/* ── Project Cards Grid ── */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[var(--green-mid)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading construction projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
            <div className="text-4xl mb-3 flex justify-center"><ClipboardList size={40} className="text-gray-400" /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Projects Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
              {searchQuery ? 'No projects match your search query.' : 'Create your first construction project to begin prediction and progress monitoring.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--green-deep)' }}
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(proj => {
              const details = proj.building_details || {};
              const progressPct = proj.overall_progress_percent || 0;
              return (
                <div
                  key={proj.project_id}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="p-6">
                    {/* Top Row: ID, Status & Edit/Delete Controls */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                          {proj.project_id}
                        </span>
                        <span 
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            proj.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {proj.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs transition-colors"
                          title="Edit Project Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.project_id, proj.project_name)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Metadata */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {proj.project_name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1"><User size={12} /> {proj.client_name}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {proj.location}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1"><Building2 size={12} /> {proj.architect_name}</span>
                    </p>

                    {/* Feature 1: Prediction & Specifications Summary */}
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 mb-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
                        <span>1. Prediction &amp; Materials</span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {details.total_built_up_area_sqft || 1500} sq.ft • {details.wall_material || 'Brick'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-snug mb-2">
                        ML Cost Model, Stage 1 Quantities, Embodied Carbon &amp; CPWD Waste Analysis.
                      </p>
                      <Link
                        to={`/architect/${proj.project_id}?tab=prediction`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline"
                      >
                        Open Prediction &amp; Materials →
                      </Link>
                    </div>

                    {/* Feature 2: Progress & Site Inspection Summary */}
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
                        <span>2. Construction Progress</span>
                        <span className="font-extrabold text-blue-700">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progressPct}%`,
                            background: progressPct >= 100 ? '#10B981' : '#2563EB',
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-blue-800 line-clamp-1 mb-2">
                        Current: <span className="font-semibold">{proj.current_stage || 'Planning & Approval'}</span>
                      </p>
                      <Link
                        to={`/architect/${proj.project_id}?tab=progress`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:underline"
                      >
                        Track 11 Stages &amp; Upload Photos →
                      </Link>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between gap-2">
                    <Link
                      to={`/architect/${proj.project_id}`}
                      className="text-xs font-bold px-3 py-2 rounded-xl text-white flex-1 text-center transition-transform active:scale-95"
                      style={{ background: 'var(--green-deep)', textDecoration: 'none' }}
                    >
                      Open Full Workspace →
                    </Link>
                    <button
                      onClick={() => {
                        setAssigningProject(proj);
                        setCustomerFormData({
                          name: proj.customer_name || proj.client_name || '',
                          email: proj.customer_email || '',
                          phone: '',
                          password: '',
                        });
                      }}
                      className="text-xs font-bold px-3 py-2 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1 shrink-0"
                      title="Assign or invite Client to monitor this project"
                    >
                      <User size={12} /> {proj.customer_email ? 'Client Linked' : 'Invite Client'}
                    </button>
                  </div>
                </div>

              );
            })}
          </div>
        )}
      </div>

      {/* ── Simplified Create New Project Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create New Project</h2>
                <p className="text-xs text-gray-500">Enter essential project information to initialize.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Meadows Residence"
                  value={formData.project_name}
                  onChange={e => handleInputChange('project_name', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. K. Ramanathan"
                  value={formData.client_name}
                  onChange={e => handleInputChange('client_name', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location (District / City) *</label>
                <select
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                >
                  {TAMIL_NADU_DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Architect / Firm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Studio EcoDesign"
                  value={formData.architect_name}
                  onChange={e => handleInputChange('architect_name', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                />
              </div>

              <div className="border-t pt-4 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  style={{ background: 'var(--green-deep)' }}
                >
                  {creating ? 'Creating...' : 'Initialize & Open Workspace →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Project Details Modal ── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Project Info</h2>
                <p className="text-xs text-gray-500">Update project identification and metadata.</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.project_name || ''}
                  onChange={e => setEditingProject({ ...editingProject, project_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.client_name || ''}
                  onChange={e => setEditingProject({ ...editingProject, client_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location (District / City)</label>
                <select
                  value={editingProject.location || 'Chennai'}
                  onChange={e => setEditingProject({ ...editingProject, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-white outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                >
                  {TAMIL_NADU_DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Architect Name</label>
                <input
                  type="text"
                  value={editingProject.architect_name || ''}
                  onChange={e => setEditingProject({ ...editingProject, architect_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editingProject.status || 'in_progress'}
                  onChange={e => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-white outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="planning">Planning</option>
                </select>
              </div>

              <div className="border-t pt-4 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  style={{ background: 'var(--green-deep)' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign / Invite Customer Modal ── */}
      {assigningProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Assign / Invite Client</h2>
                <p className="text-xs text-gray-500">Provide client credentials to access the read-only portal.</p>
              </div>

              <button
                onClick={() => setAssigningProject(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignCustomer} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                Project: <strong>{assigningProject.project_name}</strong> (<code>{assigningProject.project_id}</code>)
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerFormData.name}
                  onChange={e => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                  placeholder="e.g. Dr. V. Sundaram"
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerFormData.email}
                  onChange={e => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                  placeholder="client@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={e => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={customerFormData.password}
                  onChange={e => setCustomerFormData({ ...customerFormData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--green-mid)] font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">Client can sign in at /login with these credentials.</p>
              </div>

              <div className="border-t pt-4 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAssigningProject(null)}
                  className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  style={{ background: 'var(--green-deep)' }}
                >
                  {assigning ? 'Assigning...' : 'Confirm Client Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

