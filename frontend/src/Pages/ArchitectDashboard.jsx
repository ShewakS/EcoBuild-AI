import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Leaf, Check, AlertTriangle, User, MapPin, Building2, Trash2, Ruler, ClipboardList, Bed, Utensils, Zap, X, DollarSign, Recycle, RefreshCw, Lightbulb, Camera, Settings } from 'lucide-react';
import {
  getProject,
  updateProject,
  deleteProject,
  postEstimateCost,
  postEstimateCarbon,
  postSustainabilityScore,
  calculateWaste,
  getProjectReuse,
  updateStageProgress,
  logProgress,
  uploadSiteImage,
  getSiteImages,
  getProgressLogs,
  BASE_URL
} from '../Assets/api';
import SustainabilityScoreRing from '../Components/SustainabilityScoreRing';
import { SliderInput } from '../Components/ui/SliderInput';
import { SegmentedToggle } from '../Components/ui/SegmentedToggle';
import { StepperInput } from '../Components/ui/StepperInput';
import { TAMIL_NADU_DISTRICTS } from '../Assets/constants';

// Step indicator
function StepIndicator({ step, active, done, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
        style={{
          background: done
            ? 'var(--green-mid)'
            : active
            ? 'var(--green-deep)'
            : 'var(--bg-muted)',
          color: done || active ? 'white' : 'var(--green-muted)',
        }}
      >
        {done ? <Check size={14} /> : step}
      </div>
      <span
        className="text-sm font-bold"
        style={{
          color: active
            ? 'var(--green-deep)'
            : done
            ? 'var(--green-mid)'
            : 'var(--text-muted)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Field wrapper
function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: 'var(--green-deep)' }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// Toggle switch
function Toggle({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-medium group cursor-pointer"
      style={{ color: 'var(--text-body)' }}
    >
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-200"
        style={{
          background: checked ? 'var(--green-deep)' : 'var(--bg-muted)',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200"
          style={{ left: checked ? 'calc(100% - 22px)' : '2px' }}
        />
      </div>
      {label}
    </button>
  );
}

// Standard bedroom presets commonly used in Tamil Nadu
const BEDROOM_PRESETS = [
  { label: '10 × 10 ft', length: 10, width: 10, desc: 'Compact (100 sqft)' },
  { label: '10 × 12 ft', length: 10, width: 12, desc: 'Standard (120 sqft)' },
  { label: '10 × 14 ft', length: 10, width: 14, desc: 'Medium (140 sqft)' },
  { label: '10 × 16 ft', length: 10, width: 16, desc: 'Master Suite (160 sqft)' },
  { label: '12 × 14 ft', length: 12, width: 14, desc: 'Spacious (168 sqft)' },
  { label: '12 × 16 ft', length: 12, width: 16, desc: 'Grand Suite (192 sqft)' },
];

// Standard kitchen presets commonly used in Tamil Nadu
const KITCHEN_PRESETS = [
  { label: '8 × 8 ft', length: 8, width: 8, desc: 'Compact (64 sqft)' },
  { label: '8 × 10 ft', length: 8, width: 10, desc: 'Standard (80 sqft)' },
  { label: '10 × 10 ft', length: 10, width: 10, desc: 'Medium (100 sqft)' },
  { label: '10 × 12 ft', length: 10, width: 12, desc: 'Modular (120 sqft)' },
];

export default function ArchitectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'prediction' | 'progress' | 'analytics'
  const currentTab = searchParams.get('tab') || 'prediction';
  const setTab = (tab) => setSearchParams({ tab });

  // Step state for Prediction Form (1: Project & Rooms, 2: Site & Materials)
  const [formStep, setFormStep] = useState(1);

  // Core Project State
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Specifications (Building & Room Dimensions)
  const [specs, setSpecs] = useState({
    district: 'Chennai',
    residential_type: 'Individual Villa',
    built_up_area_sqft: 1500,
    total_built_up_area_sqft: 1500,
    plot_area_sqft: 2400,
    floors: 2,
    number_of_floors: 2,
    floor_height_ft: 10.0,
    bedrooms: 3,
    bedrooms_count: 3,
    room_sizes: [
      { name: 'Master Bedroom', length_ft: 10, width_ft: 16, area_sqft: 160, preset: '10 × 16 ft' },
      { name: 'Bedroom 2', length_ft: 10, width_ft: 12, area_sqft: 120, preset: '10 × 12 ft' },
      { name: 'Bedroom 3', length_ft: 10, width_ft: 12, area_sqft: 120, preset: '10 × 12 ft' },
    ],
    bedroom_sizes: [
      { name: 'Master Bedroom', length_ft: 10, width_ft: 16, area_sqft: 160, preset: '10 × 16 ft' },
      { name: 'Bedroom 2', length_ft: 10, width_ft: 12, area_sqft: 120, preset: '10 × 12 ft' },
      { name: 'Bedroom 3', length_ft: 10, width_ft: 12, area_sqft: 120, preset: '10 × 12 ft' },
    ],
    kitchens: 1,
    kitchens_count: 1,
    kitchen_sizes: [
      { name: 'Main Kitchen', length_ft: 10, width_ft: 10, area_sqft: 100, preset: '10 × 10 ft' }
    ],
    bathrooms: 2,
    bathrooms_count: 2,
    parking: 1,
    parking_bays: 1,
    living_area_sqft: 240,
    balconies_count: 1,
    construction_type: 'Framed RCC Structure',
    soil_type: 'Loamy',
    land_type: 'Flat',
    foundation_type: 'Isolated Footing',
    foundation_depth_ft: 6.0,
    wall_material: 'Brick',
    roof_type: 'RCC Flat',
    flooring: 'Vitrified Tile',
    finish_quality: 'Standard',
    solar_panels: false,
    rainwater_harvesting: true,
    inflation_index: 1.0,
  });

  // ML Prediction & Rule-Based Computation State
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [estimateData, setEstimateData] = useState(null);
  const [carbonData, setCarbonData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [reuseData, setReuseData] = useState(null);
  const [sustainabilityData, setSustainabilityData] = useState(null);
  const hasPrediction = !!estimateData;

  // Progress Logs & Photos
  const [progressLogs, setProgressLogs] = useState([]);
  const [siteImages, setSiteImages] = useState([]);

  // Inline Stage Update & Completion Photo State
  const [activeStageUpdate, setActiveStageUpdate] = useState(null);
  const [stageFile, setStageFile] = useState(null);
  const [stageNotes, setStageNotes] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);

  // Custom Milestone Form State
  const [customMilestone, setCustomMilestone] = useState({
    title: '',
    description: '',
    progress_percent: 100,
    recorded_by: 'Site Architect',
    file: null
  });
  const [submittingCustom, setSubmittingCustom] = useState(false);

  // ── Load Project ──
  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await getProject(projectId);
      if (!data) { setError('Project not found'); return; }
      setProject(data);

      const dbDetails = data.building_details || {};

      // Sanitize soil_type: existing DB records may have the old default
      // "Medium / Clayey" which is not a valid ProjectInputs Pydantic Literal,
      // causing a silent 422 validation error on every prediction call.
      const VALID_SOIL_TYPES = new Set(['Clay', 'Sandy', 'Loamy', 'Rocky', 'Black Cotton']);
      const sanitizeSoilType = (raw) => {
        if (!raw || !VALID_SOIL_TYPES.has(raw)) return 'Loamy';
        return raw;
      };

      const mergedSpecs = {
        ...specs,
        district: data.location || specs.district,
        ...dbDetails,
        // Explicit overrides to reconcile dual field names across BuildingDetails / ProjectInputs
        built_up_area_sqft: dbDetails.built_up_area_sqft || dbDetails.total_built_up_area_sqft || specs.built_up_area_sqft,
        total_built_up_area_sqft: dbDetails.built_up_area_sqft || dbDetails.total_built_up_area_sqft || specs.total_built_up_area_sqft,
        floors: dbDetails.floors || dbDetails.number_of_floors || specs.floors,
        number_of_floors: dbDetails.floors || dbDetails.number_of_floors || specs.number_of_floors,
        bedrooms: dbDetails.bedrooms || dbDetails.bedrooms_count || specs.bedrooms,
        bedrooms_count: dbDetails.bedrooms || dbDetails.bedrooms_count || specs.bedrooms_count,
        room_sizes: dbDetails.room_sizes?.length ? dbDetails.room_sizes : (dbDetails.bedroom_sizes?.length ? dbDetails.bedroom_sizes : specs.room_sizes),
        bedroom_sizes: dbDetails.room_sizes?.length ? dbDetails.room_sizes : (dbDetails.bedroom_sizes?.length ? dbDetails.bedroom_sizes : specs.bedroom_sizes),
        kitchens: dbDetails.kitchens || dbDetails.kitchens_count || specs.kitchens,
        kitchens_count: dbDetails.kitchens || dbDetails.kitchens_count || specs.kitchens_count,
        kitchen_sizes: dbDetails.kitchen_sizes?.length ? dbDetails.kitchen_sizes : specs.kitchen_sizes,
        bathrooms: dbDetails.bathrooms || dbDetails.bathrooms_count || specs.bathrooms,
        bathrooms_count: dbDetails.bathrooms || dbDetails.bathrooms_count || specs.bathrooms_count,
        parking: dbDetails.parking ?? dbDetails.parking_bays ?? specs.parking,
        parking_bays: dbDetails.parking ?? dbDetails.parking_bays ?? specs.parking_bays,
        // Always sanitize soil_type — legacy records have "Medium / Clayey" which fails Pydantic validation
        soil_type: sanitizeSoilType(dbDetails.soil_type || specs.soil_type),
      };
      setSpecs(mergedSpecs);

      // Parallel fetch logs and images
      const [logs, images] = await Promise.all([
        getProgressLogs(projectId).catch(() => []),
        getSiteImages(projectId).catch(() => [])
      ]);
      setProgressLogs(logs || []);
      setSiteImages(images || []);

      // Auto-run prediction using freshly merged specs (NOT stale state)
      runPrediction(mergedSpecs, data.location, false);
    } catch (err) {
      console.error(err);
      setError('Failed to load project workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Sync bedrooms (navbar style)
  const handleBedroomsChange = (count) => {
    setSpecs((prev) => {
      const currentRooms = prev.room_sizes || prev.bedroom_sizes || [];
      let nextRooms;
      if (count > currentRooms.length) {
        const newRooms = [];
        for (let i = currentRooms.length; i < count; i++) {
          const isMaster = i === 0;
          const length = isMaster ? 10 : 10;
          const width = isMaster ? 16 : 12;
          newRooms.push({
            name: isMaster ? 'Master Bedroom' : `Bedroom ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMaster ? '10 × 16 ft' : '10 × 12 ft',
          });
        }
        nextRooms = [...currentRooms, ...newRooms];
      } else {
        nextRooms = currentRooms.slice(0, count);
      }
      return {
        ...prev,
        bedrooms: count,
        bedrooms_count: count,
        room_sizes: nextRooms,
        bedroom_sizes: nextRooms,
      };
    });
  };

  const handleBedroomSizeChange = (index, presetOrCustom, customLength, customWidth) => {
    setSpecs((prev) => {
      const rooms = [...(prev.room_sizes || prev.bedroom_sizes || [])];
      if (!rooms[index]) return prev;

      if (presetOrCustom === 'Custom') {
        const len = customLength ?? rooms[index].length_ft;
        const wid = customWidth ?? rooms[index].width_ft;
        rooms[index] = {
          ...rooms[index],
          preset: 'Custom',
          length_ft: len,
          width_ft: wid,
          area_sqft: Math.round(len * wid * 10) / 10,
        };
      } else {
        const found = BEDROOM_PRESETS.find((p) => p.label === presetOrCustom);
        if (found) {
          rooms[index] = {
            ...rooms[index],
            preset: found.label,
            length_ft: found.length,
            width_ft: found.width,
            area_sqft: found.length * found.width,
          };
        }
      }
      return { ...prev, room_sizes: rooms, bedroom_sizes: rooms };
    });
  };

  // Sync kitchens (navbar style)
  const handleKitchensChange = (count) => {
    setSpecs((prev) => {
      const currentKitchens = prev.kitchen_sizes || [];
      let nextKitchens;
      if (count > currentKitchens.length) {
        const newKits = [];
        for (let i = currentKitchens.length; i < count; i++) {
          const isMain = i === 0;
          const length = isMain ? 10 : 8;
          const width = isMain ? 10 : 8;
          newKits.push({
            name: isMain ? 'Main Kitchen' : `Utility Kitchen ${i + 1}`,
            length_ft: length,
            width_ft: width,
            area_sqft: length * width,
            preset: isMain ? '10 × 10 ft' : '8 × 8 ft',
          });
        }
        nextKitchens = [...currentKitchens, ...newKits];
      } else {
        nextKitchens = currentKitchens.slice(0, count);
      }
      return {
        ...prev,
        kitchens: count,
        kitchens_count: count,
        kitchen_sizes: nextKitchens,
      };
    });
  };

  const handleKitchenSizeChange = (index, presetOrCustom, customLength, customWidth) => {
    setSpecs((prev) => {
      const kits = [...(prev.kitchen_sizes || [])];
      if (!kits[index]) return prev;

      if (presetOrCustom === 'Custom') {
        const len = customLength ?? kits[index].length_ft;
        const wid = customWidth ?? kits[index].width_ft;
        kits[index] = {
          ...kits[index],
          preset: 'Custom',
          length_ft: len,
          width_ft: wid,
          area_sqft: Math.round(len * wid * 10) / 10,
        };
      } else {
        const found = KITCHEN_PRESETS.find((p) => p.label === presetOrCustom);
        if (found) {
          kits[index] = {
            ...kits[index],
            preset: found.label,
            length_ft: found.length,
            width_ft: found.width,
            area_sqft: found.length * found.width,
          };
        }
      }
      return { ...prev, kitchen_sizes: kits };
    });
  };

  // ── Execute ML Prediction & Computations ──
  const runPrediction = async (currentSpecs, location, saveToDb = true) => {
    try {
      setPredicting(true);
      setPredictionError(''); // clear any previous prediction error
      const loc = location || currentSpecs.district || project?.location || 'Chennai';
      const payload = {
        project_id: projectId,
        district: loc,
        location: loc,
        residential_type: currentSpecs.residential_type || 'Individual Villa',
        built_up_area_sqft: parseFloat(currentSpecs.built_up_area_sqft || currentSpecs.total_built_up_area_sqft) || 1500,
        plot_area_sqft: parseFloat(currentSpecs.plot_area_sqft) || 2400,
        floors: parseInt(currentSpecs.floors || currentSpecs.number_of_floors) || 1,
        bedrooms: parseInt(currentSpecs.bedrooms || currentSpecs.bedrooms_count) || 3,
        room_sizes: currentSpecs.room_sizes || currentSpecs.bedroom_sizes || [],
        kitchens: parseInt(currentSpecs.kitchens || currentSpecs.kitchens_count) || 1,
        kitchen_sizes: currentSpecs.kitchen_sizes || [],
        bathrooms: parseInt(currentSpecs.bathrooms || currentSpecs.bathrooms_count) || 2,
        parking: parseInt(currentSpecs.parking ?? currentSpecs.parking_bays ?? 1),
        soil_type: currentSpecs.soil_type || 'Loamy',
        land_type: currentSpecs.land_type || 'Flat',
        foundation_type: currentSpecs.foundation_type || 'Isolated Footing',
        foundation_depth_ft: parseFloat(currentSpecs.foundation_depth_ft) || 6.0,
        construction_type: currentSpecs.construction_type || 'Framed RCC Structure',
        wall_material: currentSpecs.wall_material || 'Brick',
        roof_type: currentSpecs.roof_type || 'RCC Flat',
        flooring: currentSpecs.flooring || 'Vitrified Tile',
        finish_quality: currentSpecs.finish_quality || 'Standard',
        solar_panels: !!currentSpecs.solar_panels,
        rainwater_harvesting: !!currentSpecs.rainwater_harvesting,
        inflation_index: parseFloat(currentSpecs.inflation_index) || 1.0,
      };

      // 1. ML Cost & Stage 1 Materials
      const estRes = await postEstimateCost(payload);
      setEstimateData(estRes);

      // 2. IFC Indian Embodied Carbon
      const carbonRes = await postEstimateCarbon(payload);
      setCarbonData(carbonRes);

      // 3. Authentic CPWD Waste
      const q = estRes.quantities?.ml || estRes.quantities || {};
      const wasteMats = [
        { material_key: 'cement', quantity: q.cement_bags || 550, unit: 'Bags', unit_rate_inr: 420 },
        { material_key: 'steel', quantity: q.steel_tons || 4.5, unit: 'Tonnes', unit_rate_inr: 68000 },
        { material_key: 'bricks', quantity: q.brick_count || q.bricks_pieces || 13000, unit: 'Pieces', unit_rate_inr: 11 },
        { material_key: 'sand', quantity: q.sand_cft || (q.sand_tons ? Math.round(q.sand_tons * 25) : 1600), unit: 'Cu.Ft', unit_rate_inr: 65 },
        { material_key: 'aggregate', quantity: q.aggregate_cft || (q.aggregate_tons ? Math.round(q.aggregate_tons * 25) : 2000), unit: 'Cu.Ft', unit_rate_inr: 45 },
        { material_key: 'paint', quantity: 240, unit: 'Litres', unit_rate_inr: 320 },
      ];
      const wasteRes = await calculateWaste(wasteMats, projectId);
      setWasteData(wasteRes);

      // 4. Safe Material Reuse
      const reuseRes = await getProjectReuse(['Bricks', 'Steel', 'Aggregate', 'Sand', 'Timber'], projectId);
      setReuseData(reuseRes);

      // 5. Sustainability Score
      const sustRes = await postSustainabilityScore({
        inputs: payload,
        waste_percent: wasteRes?.average_waste_percent || 5.0,
        carbon_footprint_kgco2e: carbonRes?.total_carbon_footprint_kgco2e || null,
        carbon_footprint_kgco2e_per_sqft: carbonRes?.carbon_intensity_kgco2e_per_sqft || null,
        estimate_id: estRes?.estimate_id || null,
      });
      setSustainabilityData(sustRes);

      // Optionally save building details back to MongoDB
      if (saveToDb) {
        await updateProject(projectId, {
          building_details: currentSpecs,
          estimate_id: estRes?.estimate_id || undefined,
        });
      }
    } catch (err) {
      console.error('[ArchitectDashboard] Prediction failed:', err);
      // Surface the error visibly so the user knows the estimate didn't run,
      // rather than silently falling back to hardcoded placeholder values.
      setEstimateData(null);
      const userMsg = err?.message?.includes('422')
        ? 'Validation error: one or more building specifications are invalid. Please review your inputs and try again.'
        : `Prediction failed: ${err?.message || 'Unknown error'}. Please check that the backend server is running.`;
      setPredictionError(userMsg);
    } finally {
      setPredicting(false);
    }
  };

  // Change Material and re-estimate
  const handleMaterialChange = (field, val) => {
    const updated = { ...specs, [field]: val };
    setSpecs(updated);
    runPrediction(updated, project?.location, true);
  };

  // ── Inline Stage Completion & Photo Upload ──
  const handleCompleteStageInline = async (stage) => {
    try {
      setUpdatingStage(true);
      // 1. Update stage status & progress
      const updatedProj = await updateStageProgress(projectId, stage.stage_id, {
        status: 'completed',
        progress_percent: 100.0,
        notes: stageNotes || `${stage.stage_name} inspected and confirmed completed.`,
      });
      setProject(updatedProj);

      // 2. Upload completion photo if file was selected
      if (stageFile) {
        const formData = new FormData();
        formData.append('project_id', projectId);
        formData.append('stage_id', stage.stage_id);
        formData.append('stage_name', stage.stage_name);
        formData.append('caption', `${stage.stage_name} — Task Completion Photo`);
        formData.append('uploaded_by', 'Site Architect');
        formData.append('file', stageFile);
        const uploaded = await uploadSiteImage(formData);
        setSiteImages(prev => [uploaded, ...prev]);
      }

      // 3. Add to progress audit trail
      const newLog = await logProgress({
        project_id: projectId,
        stage_id: stage.stage_id,
        stage_name: stage.stage_name,
        progress_percent: 100.0,
        status: 'completed',
        log_notes: stageNotes || `${stage.stage_name} completed with site photo verification.`,
        recorded_by: 'Site Architect',
      });
      setProgressLogs(prev => [newLog, ...prev]);

      setActiveStageUpdate(null);
      setStageFile(null);
      setStageNotes('');
      alert(`Milestone "${stage.stage_name}" marked as Completed!`);
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    } finally {
      setUpdatingStage(false);
    }
  };

  // ── Add Custom Process / Milestone ──
  const handleAddCustomMilestone = async (e) => {
    e.preventDefault();
    if (!customMilestone.title.trim()) {
      alert('Please enter a milestone / process title.');
      return;
    }
    try {
      setSubmittingCustom(true);
      // 1. Upload photo if selected
      if (customMilestone.file) {
        const formData = new FormData();
        formData.append('project_id', projectId);
        formData.append('stage_name', customMilestone.title);
        formData.append('caption', customMilestone.title);
        formData.append('uploaded_by', customMilestone.recorded_by || 'Site Architect');
        formData.append('file', customMilestone.file);
        const uploaded = await uploadSiteImage(formData);
        setSiteImages(prev => [uploaded, ...prev]);
      }

      // 2. Record log
      const newLog = await logProgress({
        project_id: projectId,
        stage_id: 99, // custom ID
        stage_name: `Custom: ${customMilestone.title}`,
        progress_percent: parseFloat(customMilestone.progress_percent) || 100.0,
        status: 'completed',
        log_notes: customMilestone.description || 'Custom construction activity verified.',
        recorded_by: customMilestone.recorded_by || 'Site Architect',
      });
      setProgressLogs(prev => [newLog, ...prev]);

      setCustomMilestone({
        title: '',
        description: '',
        progress_percent: 100,
        recorded_by: 'Site Architect',
        file: null,
      });
      alert('Custom milestone & photo recorded successfully!');
    } catch (err) {
      alert('Failed to record custom milestone: ' + err.message);
    } finally {
      setSubmittingCustom(false);
    }
  };

  // Delete project handler
  const handleDeleteThisProject = async () => {
    if (window.confirm(`Are you sure you want to delete project "${project.project_name}"?\nThis cannot be undone.`)) {
      try {
        await deleteProject(projectId);
        navigate('/projects');
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--green-mid)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-8 text-center" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border shadow-sm">
          <div className="text-3xl mb-3 flex justify-center"><AlertTriangle size={36} className="text-amber-500" /></div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Project Not Available</h2>
          <p className="text-sm text-gray-600 mb-4">{error || 'Project data could not be retrieved.'}</p>
          <Link to="/projects" className="px-4 py-2 rounded-xl text-white text-xs font-bold" style={{ background: 'var(--green-deep)' }}>
            ← Back to Projects List
          </Link>
        </div>
      </div>
    );
  }

  const stages = project.stages || [];
  const progressPct = project.overall_progress_percent || 0;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-base)' }}>
      {/* ── Top Workspace Bar ── */}
      <div 
        className="border-b sticky top-16 z-40 bg-white/95 backdrop-blur-md"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/projects" 
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs"
              title="Return to Projects List"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                  {project.project_name}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {project.project_id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {project.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><User size={12} /> {project.client_name}</span> • <span className="inline-flex items-center gap-1"><MapPin size={12} /> {project.location}</span> • <span className="inline-flex items-center gap-1"><Building2 size={12} /> {project.architect_name}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Overall Progress</span>
                <span className="text-xs font-extrabold" style={{ color: 'var(--green-deep)' }}>{progressPct}%</span>
              </div>
              <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, var(--green-mid), var(--green-deep))'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleDeleteThisProject}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              title="Delete Project"
            >
              <Trash2 size={14} className="inline mr-1" /> Delete
            </button>
          </div>
        </div>

        {/* ── Two Primary Sections: 1. Prediction & Specs | 2. Progress & Photos ── */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t py-1">
          <button
            onClick={() => setTab('prediction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'prediction' 
                ? 'bg-[var(--green-deep)] text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Ruler size={14} />
            <span>1. Specifications, Cost &amp; Material Prediction</span>
          </button>

          <button
            onClick={() => setTab('progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'progress' 
                ? 'bg-[var(--green-deep)] text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ClipboardList size={14} />
            <span>2. Construction Progress &amp; Inspection Photos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold ml-1">
              {progressPct}%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* ═══════════════════════════════════════════════════════════════════
            VIEW 1: SPECIFICATIONS, COST & MATERIAL PREDICTION + FEATURES
        ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === 'prediction' && (
          <div className="space-y-8">
            {/* Step indicators matching navbar style */}
            <div
              className="flex items-center gap-6 rounded-2xl p-4 sm:p-5 border bg-white shadow-xs"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-0"
              >
                <StepIndicator step={1} active={formStep === 1} done={formStep > 1} label="1. Project, Room & Kitchen Dimensions" />
              </button>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <button
                type="button"
                onClick={() => setFormStep(2)}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-0"
              >
                <StepIndicator step={2} active={formStep === 2} done={hasPrediction} label="2. Site, Structural & Material Specs" />
              </button>
            </div>

            {/* ── STEP 1: Project & Room Dimensions ── */}
            {formStep === 1 && (
              <div
                className="rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 shadow-sm bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* District / Location */}
                  <Field label="Tamil Nadu District / Location">
                    <select
                      id="field-district"
                      value={specs.district || project?.location || 'Chennai'}
                      onChange={(e) => setSpecs({ ...specs, district: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-sm font-semibold border appearance-none focus:outline-none cursor-pointer"
                      style={{
                        background: 'var(--bg-muted)',
                        borderColor: 'var(--border)',
                        color: 'var(--green-deep)',
                      }}
                    >
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Residential Type */}
                  <Field label="Residential Building Type">
                    <select
                      id="field-residential-type"
                      value={specs.residential_type || 'Individual Villa'}
                      onChange={(e) => setSpecs({ ...specs, residential_type: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-sm font-bold border appearance-none focus:outline-none cursor-pointer"
                      style={{
                        background: 'var(--bg-muted)',
                        borderColor: 'var(--border)',
                        color: 'var(--green-deep)',
                      }}
                    >
                      <option value="Individual Villa">Individual Villa / Bungalow</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Independent House">Independent House (Single/Multi-story)</option>
                      <option value="Duplex House">Duplex House</option>
                      <option value="Row House">Row House / Gated Community</option>
                    </select>
                  </Field>
                </div>

                {/* Area Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <Field label="Built-up Area (Sq Ft)" hint="Total constructed floor area across all floors">
                    <SliderInput
                      id="field-built-up-area"
                      value={specs.built_up_area_sqft || specs.total_built_up_area_sqft || 1500}
                      onChange={(v) => setSpecs({ ...specs, built_up_area_sqft: v, total_built_up_area_sqft: v })}
                      min={200}
                      max={10000}
                      step={50}
                      unit="sqft"
                      presets={[800, 1200, 1500, 2000, 2500, 3600, 5000]}
                    />
                  </Field>

                  <Field label="Plot / Land Area (Sq Ft)" hint="Total land area (1 Ground = 2,400 sqft in TN)">
                    <SliderInput
                      id="field-plot-area"
                      value={specs.plot_area_sqft || 2400}
                      onChange={(v) => setSpecs({ ...specs, plot_area_sqft: v })}
                      min={300}
                      max={20000}
                      step={100}
                      unit="sqft"
                      presets={[
                        { label: '½ Ground (1,200)', value: 1200 },
                        { label: '1 Ground (2,400)', value: 2400 },
                        { label: '1.5 Ground (3,600)', value: 3600 },
                        { label: '2 Grounds (4,800)', value: 4800 },
                        { label: '10,000 sqft', value: 10000 },
                      ]}
                    />
                  </Field>
                </div>

                {/* Quantitative Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                  <Field label="Floors">
                    <StepperInput
                      id="field-floors"
                      value={specs.floors || specs.number_of_floors || 2}
                      onChange={(v) => setSpecs({ ...specs, floors: v, number_of_floors: v })}
                      min={1}
                      max={20}
                      label="floors"
                    />
                  </Field>
                  <Field label="Bedrooms">
                    <StepperInput
                      id="field-bedrooms"
                      value={specs.bedrooms || specs.bedrooms_count || 3}
                      onChange={handleBedroomsChange}
                      min={0}
                      max={15}
                      label="bedrooms"
                    />
                  </Field>
                  <Field label="Kitchens">
                    <StepperInput
                      id="field-kitchens"
                      value={specs.kitchens || specs.kitchens_count || 1}
                      onChange={handleKitchensChange}
                      min={0}
                      max={5}
                      label="kitchens"
                    />
                  </Field>
                  <Field label="Bathrooms">
                    <StepperInput
                      id="field-bathrooms"
                      value={specs.bathrooms || specs.bathrooms_count || 2}
                      onChange={(v) => setSpecs({ ...specs, bathrooms: v, bathrooms_count: v })}
                      min={1}
                      max={15}
                      label="bathrooms"
                    />
                  </Field>
                  <Field label="Car Parking">
                    <StepperInput
                      id="field-parking"
                      value={specs.parking ?? specs.parking_bays ?? 1}
                      onChange={(v) => setSpecs({ ...specs, parking: v, parking_bays: v })}
                      min={0}
                      max={10}
                      label="parking"
                    />
                  </Field>
                </div>

                {/* ── Bedroom Sizes Configuration ── */}
                {(specs.bedrooms > 0 || specs.bedrooms_count > 0) && (specs.room_sizes || specs.bedroom_sizes) && (
                  <div
                    className="rounded-2xl p-5 border flex flex-col gap-4"
                    style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-[#1A4D2E]"><Bed size={20} /></span>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A4D2E]">Bedroom Dimensions &amp; Sizing</h3>
                          <p className="text-xs text-[#7A8C6E]">Select standard room dimensions or customize length &amp; width.</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-xl text-xs font-bold bg-[#1A4D2E] text-white">
                        Total: {(specs.room_sizes || specs.bedroom_sizes || []).reduce((sum, r) => sum + (r.area_sqft || (r.length_ft * r.width_ft)), 0).toLocaleString()} sqft
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-1">
                      {(specs.room_sizes || specs.bedroom_sizes || []).map((room, idx) => {
                        const isCustom = room.preset === 'Custom';
                        return (
                          <div key={idx} className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">{room.name}</span>
                              <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                                {room.length_ft} × {room.width_ft} ft = {room.area_sqft || (room.length_ft * room.width_ft)} sqft
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-1.5">
                              {BEDROOM_PRESETS.map((preset) => {
                                const active = room.preset === preset.label;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handleBedroomSizeChange(idx, preset.label)}
                                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                      active
                                        ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                        : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                    }`}
                                    title={preset.desc}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => handleBedroomSizeChange(idx, 'Custom')}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                  isCustom
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                    : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                }`}
                              >
                                Custom Dimension
                              </button>
                            </div>
                            {isCustom && (
                              <div className="flex items-center gap-3 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#7A8C6E]">Length (ft):</span>
                                  <input
                                    type="number" min={6} max={50} step={0.5}
                                    value={room.length_ft}
                                    onChange={(e) => handleBedroomSizeChange(idx, 'Custom', parseFloat(e.target.value) || 0, room.width_ft)}
                                    className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                  />
                                </div>
                                <span className="text-sm font-bold text-[#7A8C6E]">×</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#7A8C6E]">Width (ft):</span>
                                  <input
                                    type="number" min={6} max={50} step={0.5}
                                    value={room.width_ft}
                                    onChange={(e) => handleBedroomSizeChange(idx, 'Custom', room.length_ft, parseFloat(e.target.value) || 0)}
                                    className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Kitchen Sizes Configuration ── */}
                {(specs.kitchens > 0 || specs.kitchens_count > 0) && specs.kitchen_sizes && (
                  <div
                    className="rounded-2xl p-5 border flex flex-col gap-4"
                    style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-[#1A4D2E]"><Utensils size={20} /></span>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A4D2E]">Kitchen Dimensions &amp; Sizing</h3>
                          <p className="text-xs text-[#7A8C6E]">Choose kitchen sizes for exact plumbing lines &amp; layout planning.</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-xl text-xs font-bold bg-[#2E7D52] text-white">
                        Total: {specs.kitchen_sizes.reduce((sum, k) => sum + (k.area_sqft || (k.length_ft * k.width_ft)), 0).toLocaleString()} sqft
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-1">
                      {specs.kitchen_sizes.map((kit, idx) => {
                        const isCustom = kit.preset === 'Custom';
                        return (
                          <div key={idx} className="rounded-xl p-4 bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wide text-[#1A4D2E]">{kit.name}</span>
                              <span className="text-xs font-bold text-[#2E7D52] bg-[#EDE8DC] px-2 py-0.5 rounded-lg">
                                {kit.length_ft} × {kit.width_ft} ft = {kit.area_sqft || (kit.length_ft * kit.width_ft)} sqft
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-1.5">
                              {KITCHEN_PRESETS.map((preset) => {
                                const active = kit.preset === preset.label;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handleKitchenSizeChange(idx, preset.label)}
                                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                      active
                                        ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                        : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                    }`}
                                    title={preset.desc}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => handleKitchenSizeChange(idx, 'Custom')}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                                  isCustom
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-xs'
                                    : 'bg-[#FAFAF7] text-[#4B5945] border-[#DDD8CD] hover:bg-[#EDE8DC]'
                                }`}
                              >
                                Custom Dimension
                              </button>
                            </div>
                            {isCustom && (
                              <div className="flex items-center gap-3 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#7A8C6E]">Length (ft):</span>
                                  <input
                                    type="number" min={5} max={40} step={0.5}
                                    value={kit.length_ft}
                                    onChange={(e) => handleKitchenSizeChange(idx, 'Custom', parseFloat(e.target.value) || 0, kit.width_ft)}
                                    className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                  />
                                </div>
                                <span className="text-sm font-bold text-[#7A8C6E]">×</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#7A8C6E]">Width (ft):</span>
                                  <input
                                    type="number" min={5} max={40} step={0.5}
                                    value={kit.width_ft}
                                    onChange={(e) => handleKitchenSizeChange(idx, 'Custom', kit.length_ft, parseFloat(e.target.value) || 0)}
                                    className="w-16 rounded-lg px-2 py-1 text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Finish Quality & Add-ons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <Field label="Finish Quality Level">
                    <SegmentedToggle
                      id="field-finish-quality"
                      options={[
                        { value: 'Standard', label: 'Standard' },
                        { value: 'Premium', label: 'Premium (+15%)' },
                        { value: 'Luxury', label: 'Luxury (+35%)' },
                      ]}
                      value={specs.finish_quality || 'Standard'}
                      onChange={(v) => setSpecs({ ...specs, finish_quality: v })}
                    />
                  </Field>

                  <Field label="Sustainable Add-ons">
                    <div className="flex flex-col gap-3 pt-1">
                      <Toggle
                        id="toggle-solar"
                        checked={!!specs.solar_panels}
                        onChange={(v) => setSpecs({ ...specs, solar_panels: v })}
                        label="Rooftop Solar Panels"
                      />
                      <Toggle
                        id="toggle-rwh"
                        checked={!!specs.rainwater_harvesting}
                        onChange={(v) => setSpecs({ ...specs, rainwater_harvesting: v })}
                        label="Rainwater Harvesting (TN Compliant)"
                      />
                    </div>
                  </Field>
                </div>

                {/* Market Inflation Index */}
                <Field label="Market Inflation Index" hint="Adjust for local market material rate trends (1.00 = baseline)">
                  <SliderInput
                    id="field-inflation"
                    value={specs.inflation_index || 1.0}
                    onChange={(v) => setSpecs({ ...specs, inflation_index: v })}
                    min={0.8}
                    max={2.0}
                    step={0.05}
                    formatValue={(v) => `${v.toFixed(2)}x`}
                  />
                </Field>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => runPrediction(specs, project?.location, true)}
                    disabled={predicting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, var(--rust), #B23B0E)' }}
                  >
                    {predicting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={14} />}
                    <span>{predicting ? 'Predicting...' : 'Quick Predict Cost'}</span>
                  </button>

                  <button
                    id="btn-next-step"
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                    style={{ background: 'var(--green-deep)' }}
                  >
                    Next: Site &amp; Structure Specifications →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Site & Structure Specifications ── */}
            {formStep === 2 && (
              <div
                className="rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 shadow-sm bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Soil Type">
                    <SegmentedToggle
                      id="field-soil-type"
                      options={[
                        { value: 'Clay', label: 'Clay' },
                        { value: 'Sandy', label: 'Sandy' },
                        { value: 'Loamy', label: 'Loamy' },
                        { value: 'Rocky', label: 'Rocky' },
                        { value: 'Black Cotton', label: 'Black Cotton' },
                      ]}
                      value={specs.soil_type || 'Loamy'}
                      onChange={(v) => setSpecs({ ...specs, soil_type: v })}
                    />
                  </Field>

                  <Field label="Land Topography">
                    <SegmentedToggle
                      id="field-land-type"
                      options={[
                        { value: 'Flat', label: 'Flat Land' },
                        { value: 'Sloped', label: 'Sloped Terrain' },
                        { value: 'Hilly', label: 'Hilly Area' },
                      ]}
                      value={specs.land_type || 'Flat'}
                      onChange={(v) => setSpecs({ ...specs, land_type: v })}
                    />
                  </Field>

                  <Field label="Foundation Type">
                    <SegmentedToggle
                      id="field-foundation-type"
                      options={[
                        { value: 'Strip', label: 'Strip' },
                        { value: 'Raft', label: 'Raft' },
                        { value: 'Pile', label: 'Pile' },
                        { value: 'Isolated Footing', label: 'Isolated' },
                      ]}
                      value={specs.foundation_type || 'Isolated Footing'}
                      onChange={(v) => setSpecs({ ...specs, foundation_type: v })}
                    />
                  </Field>

                  <Field label="Foundation Depth">
                    <SliderInput
                      id="field-foundation-depth"
                      value={specs.foundation_depth_ft || 6.0}
                      onChange={(v) => setSpecs({ ...specs, foundation_depth_ft: v })}
                      min={2}
                      max={30}
                      step={0.5}
                      unit="ft"
                    />
                  </Field>

                  <Field label="Wall Material">
                    <SegmentedToggle
                      id="field-wall-material"
                      options={[
                        { value: 'Brick', label: 'Burnt Clay Brick' },
                        { value: 'AAC Block', label: 'AAC Light Block' },
                        { value: 'Fly Ash Brick', label: 'Fly Ash Brick' },
                        { value: 'Hollow Block', label: 'Hollow Block' },
                      ]}
                      value={specs.wall_material || 'Brick'}
                      onChange={(v) => setSpecs({ ...specs, wall_material: v })}
                    />
                  </Field>

                  <Field label="Roof Type">
                    <SegmentedToggle
                      id="field-roof-type"
                      options={[
                        { value: 'RCC Flat', label: 'RCC Flat Slab' },
                        { value: 'Sloped Tile', label: 'Sloped Clay Tile' },
                        { value: 'Metal Sheet', label: 'Metal Sheet' },
                        { value: 'Thatched', label: 'Traditional' },
                      ]}
                      value={specs.roof_type || 'RCC Flat'}
                      onChange={(v) => setSpecs({ ...specs, roof_type: v })}
                    />
                  </Field>

                  <Field label="Flooring Type" hint="Selected flooring material">
                    <SegmentedToggle
                      id="field-flooring"
                      options={[
                        { value: 'Ceramic Tile', label: 'Ceramic' },
                        { value: 'Vitrified Tile', label: 'Vitrified' },
                        { value: 'Granite', label: 'Granite' },
                        { value: 'Marble', label: 'Marble' },
                      ]}
                      value={specs.flooring || 'Vitrified Tile'}
                      onChange={(v) => setSpecs({ ...specs, flooring: v })}
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    id="btn-prev-step"
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#EDE8DC] cursor-pointer"
                    style={{ borderColor: 'var(--border)', color: 'var(--green-deep)', background: 'var(--bg-muted)' }}
                  >
                    ← Back to Step 1
                  </button>

                  <button
                    id="btn-generate-estimate"
                    type="button"
                    onClick={() => runPrediction(specs, project?.location, true)}
                    disabled={predicting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #D4541A, var(--rust))' }}
                  >
                    {predicting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Predicting Cost &amp; Materials…
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5"><Zap size={14} /> Predict Cost &amp; Material Quantity →</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Prediction Loading State ── */}
            {predicting && (
              <div className="bg-white rounded-2xl border p-8 text-center shadow-sm">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: 'var(--green-mid)', borderTopColor: 'transparent' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--green-deep)' }}>
                  Running ML predictions — cost, materials, carbon &amp; waste analysis...
                </p>
              </div>
            )}

            {/* ── Prediction Error Banner ── */}
            {!predicting && predictionError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="text-red-500 mt-0.5 flex-shrink-0">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800 mb-1">Prediction Failed</p>
                  <p className="text-xs text-red-700">{predictionError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPredictionError('')}
                  className="text-red-400 hover:text-red-600 text-sm font-bold flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* ── Ready to Predict Placeholder ── */}
            {!predicting && !hasPrediction && !predictionError && (
              <div className="bg-white rounded-2xl border p-10 text-center shadow-sm">
                <div className="text-4xl mb-3 flex justify-center"><Zap size={36} className="text-emerald-700" /></div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--green-deep)' }}>Ready to Predict</h3>
                <p className="text-sm text-gray-500">
                  Configure your building specifications above and click <strong>Predict Cost &amp; Material Quantity</strong>.
                </p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                POST-PREDICTION RESULTS & MATERIAL SWITCHING
            ═══════════════════════════════════════════════════════════════════ */}
            {hasPrediction && !predicting && (
              <div className="space-y-8">
                {/* 1. Cost & Material Prediction Card with LIVE MATERIAL SWITCHING */}
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                        <DollarSign size={14} /> Phase 1 &amp; Phase 2 ML Predictions
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                        ₹ {estimateData?.breakdown?.total_cost
                          ? Math.round(estimateData.breakdown.total_cost).toLocaleString('en-IN')
                          : '—'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Total Project Cost • Rate: ₹{' '}
                        {estimateData?.breakdown?.total_cost && estimateData?.inputs?.built_up_area_sqft
                          ? Math.round(estimateData.breakdown.total_cost / estimateData.inputs.built_up_area_sqft).toLocaleString('en-IN')
                          : '—'} / sq.ft
                      </p>
                    </div>

                    {/* Interactive Material Switcher */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-gray-700">Switch Material &amp; Recalculate:</span>
                      <select
                        value={specs.wall_material}
                        onChange={e => handleMaterialChange('wall_material', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white outline-none"
                      >
                        <option value="AAC Block">AAC Block</option>
                        <option value="Fly Ash Brick">Fly Ash Brick</option>
                        <option value="Brick">Red Clay Brick</option>
                      </select>
                      <select
                        value={specs.flooring}
                        onChange={e => handleMaterialChange('flooring', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white outline-none"
                      >
                        <option value="Vitrified Tile">Vitrified Tile</option>
                        <option value="Granite">Granite</option>
                        <option value="Ceramic Tile">Ceramic Tile</option>
                      </select>
                    </div>
                  </div>

                  {/* Predicted Physical Quantities */}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Physical Material Quantities (Trained ML Regressor Output)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { name: 'Cement', qty: estimateData?.quantities?.ml?.cement_bags, unit: 'Bags' },
                      { name: 'Steel / Rebar', qty: estimateData?.quantities?.ml?.steel_tons, unit: 'Tonnes' },
                      { name: 'Bricks / Blocks', qty: estimateData?.quantities?.ml?.brick_count, unit: 'Pieces' },
                      { name: 'Sand (M-Sand)', qty: estimateData?.quantities?.ml?.sand_tons
                          ? Math.round(estimateData.quantities.ml.sand_tons * 25) : undefined, unit: 'Cu.Ft' },
                      { name: 'Coarse Aggregate', qty: estimateData?.quantities?.ml?.aggregate_tons
                          ? Math.round(estimateData.quantities.ml.aggregate_tons * 25) : undefined, unit: 'Cu.Ft' },
                    ].map(mat => (
                      <div key={mat.name} className="p-3.5 rounded-xl border bg-gray-50">
                        <span className="text-xs font-bold text-gray-700 block">{mat.name}</span>
                        <span className="text-lg font-extrabold text-gray-900 block my-0.5">
                          {mat.qty != null ? (typeof mat.qty === 'number' ? mat.qty.toLocaleString('en-IN') : mat.qty) : '—'}
                        </span>
                        <span className="text-[10px] text-gray-500">{mat.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Embodied Carbon Emission Card */}
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-1">
                        <Leaf size={14} className="text-emerald-600" /> IFC Indian Carbon Factor Dataset
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Embodied Carbon Footprint</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-blue-700 block">
                        {carbonData?.total_carbon_tons != null
                          ? `${carbonData.total_carbon_tons.toFixed(1)} tCO₂e`
                          : '—'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Intensity:{' '}
                        {carbonData?.carbon_intensity_kg_per_sqft != null
                          ? `${carbonData.carbon_intensity_kg_per_sqft.toFixed(1)} kgCO₂e/sq.ft`
                          : '—'}{' '}
                        (Baseline: 36.0)
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
                        <tr>
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3">Quantity</th>
                          <th className="py-2.5 px-3">Embodied Carbon (tCO₂e)</th>
                          <th className="py-2.5 px-3">Benchmark Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {carbonData?.materials?.length > 0
                          ? carbonData.materials.slice(0, 6).map(r => (
                            <tr key={r.material_name}>
                              <td className="py-2.5 px-3 font-semibold text-gray-800">{r.material_name}</td>
                              <td className="py-2.5 px-3 text-gray-600">
                                {r.quantity != null ? `${r.quantity.toLocaleString('en-IN')} ${r.unit}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-gray-900">
                                {r.carbon_emission_tons != null ? r.carbon_emission_tons.toFixed(1) : '—'} tCO₂e
                              </td>
                              <td className="py-2.5 px-3 text-emerald-700 font-medium">
                                {r.green_alternative || 'Standard specification'}
                              </td>
                            </tr>
                          ))
                          : (
                            <tr>
                              <td colSpan={4} className="py-4 px-3 text-center text-gray-400 italic">
                                Run prediction to see per-material carbon breakdown
                              </td>
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Authentic Material Wastage (CPWD/BMTPC) Card */}
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 mb-1">
                        <Recycle size={14} /> CPWD • BMTPC • NICMAR Standards
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Job-Site Material Wastage &amp; Financial Impact</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-red-600 block">
                        {wasteData?.total_financial_loss_inr != null
                          ? `₹ ${wasteData.total_financial_loss_inr.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Total Wastage Loss ({wasteData?.average_waste_percent != null ? `${wasteData.average_waste_percent}%` : '—'} avg site waste)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(wasteData?.materials || []).map(mat => (
                      <div key={mat.material_key} className="p-3.5 rounded-xl border bg-gray-50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-800">{mat.material_name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              mat.waste_risk_level === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                              mat.waste_risk_level === 'Normal' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {mat.waste_risk_level}
                            </span>
                          </div>
                          <div className="text-xs py-1">
                            <span className="text-gray-500">Waste: </span>
                            <span className="font-bold text-gray-800">{mat.applied_waste_percent}%</span>
                            <span className="text-gray-400"> ({mat.estimated_waste_quantity} {mat.unit})</span>
                          </div>
                          <div className="text-xs text-red-600 font-bold">
                            Loss: ₹ {mat.estimated_financial_loss_inr?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 border-t pt-1.5 mt-2">
                          Standard: {mat.min_waste_percent}% – {mat.max_waste_percent}% ({mat.standard_source.split('&')[0]})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Safe Suggestions for Material Reuse & Material Suggestions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Reuse Suggestions with Structural Warning */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCw size={18} className="text-emerald-800" />
                      <h3 className="text-base font-bold text-gray-900">Safe Material Reuse Suggestions</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-900 mb-4 font-semibold flex items-start gap-1.5">
                      <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>Never reuse rebar cut-offs or recycled rubble in primary structural columns, beams, or high-stress foundations.</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      {(reuseData?.recommendations?.slice(0, 3) || []).map(r => (
                        <div key={r.rule_id} className="p-3 rounded-xl border bg-gray-50">
                          <span className="font-bold text-gray-900 block">{r.safe_application}</span>
                          <span className="text-gray-600 block text-[11px] mt-0.5">{r.benefits}</span>
                          <span className="text-emerald-700 font-semibold block text-[11px] mt-1">{r.estimated_savings_inr}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Material Suggestions & Sustainability Rating */}
                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={18} className="text-amber-500" />
                        <h3 className="text-base font-bold text-gray-900">Low-Carbon Material Suggestions</h3>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-xl border bg-emerald-50/50">
                          <span className="font-bold text-emerald-900 block">AAC Blocks vs Clay Bricks</span>
                          <span className="text-gray-600 text-[11px] block">
                            AAC Blocks reduce structural dead load by 50%, saving 12% rebar steel and ₹18/sq.ft in mortar.
                          </span>
                        </div>
                        <div className="p-3 rounded-xl border bg-emerald-50/50">
                          <span className="font-bold text-emerald-900 block">Manufactured Sand (M-Sand)</span>
                          <span className="text-gray-600 text-[11px] block">
                            Eliminates riverbed dredging, provides zero silt contamination, and reduces plaster rebound waste.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Score Gauge */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <SustainabilityScoreRing score={sustainabilityData?.score ?? 0} size={65} strokeWidth={7} />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Sustainability Score</span>
                          <span className="text-lg font-extrabold text-emerald-800">
                            {sustainabilityData?.score != null
                              ? `${sustainabilityData.score}/100 • Grade ${sustainabilityData.grade || 'N/A'}`
                              : 'Run prediction to calculate'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            VIEW 2: CONSTRUCTION PROGRESS & INTEGRATED SITE PHOTO GALLERY
        ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === 'progress' && (
          <div className="space-y-8">
            {/* 11-Stage Checklist with Inline Photo Upload */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">11 Construction Stages Progress</h2>
                  <p className="text-xs text-gray-500">
                    Mark stages completed and upload verification photos directly on the stage.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-blue-600">{progressPct}% Overall Complete</span>
                  <span className="text-[11px] text-gray-400 block">
                    {stages.filter(s => s.status === 'completed').length} of {stages.length} Milestones Cleared
                  </span>
                </div>
              </div>

              {/* Stage Items List */}
              <div className="space-y-4">
                {stages.map(stage => {
                  const isCompleted = stage.status === 'completed';
                  const isInProg = stage.status === 'in_progress';
                  const isUpdatingThis = activeStageUpdate?.stage_id === stage.stage_id;

                  return (
                    <div
                      key={stage.stage_id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted ? 'bg-emerald-50/40 border-emerald-200' :
                        isInProg ? 'bg-blue-50/40 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted ? 'bg-emerald-600 text-white' :
                            isInProg ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {isCompleted ? <Check size={14} /> : stage.order}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{stage.stage_name}</h4>
                            <p className="text-xs text-gray-500">{stage.description}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' :
                            isInProg ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {stage.status.replace('_', ' ')} ({stage.progress_percent || 0}%)
                          </span>

                          <button
                            onClick={() => {
                              setActiveStageUpdate(isUpdatingThis ? null : stage);
                              setStageFile(null);
                              setStageNotes('');
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold border bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            {isUpdatingThis ? 'Cancel' : isCompleted ? 'Re-upload / Edit' : 'Mark Completed + Photo'}
                          </button>
                        </div>
                      </div>

                      {/* Attached Completion Photo if exists */}
                      {stage.completion_image_url && (
                        <div className="mt-3 ml-10 flex items-center gap-3 p-2 rounded-lg bg-white border max-w-sm">
                          <img
                            src={stage.completion_image_url.startsWith('http') ? stage.completion_image_url : `${BASE_URL}${stage.completion_image_url}`}
                            alt="Completion"
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <span className="text-[11px] font-semibold text-emerald-800 inline-flex items-center gap-1">
                            <Check size={14} /> Verified Completion Photo Attached
                          </span>
                        </div>
                      )}

                      {/* Inline Stage Completion & Photo Upload Form */}
                      {isUpdatingThis && (
                        <div className="mt-4 ml-10 p-4 rounded-xl bg-white border border-emerald-300 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 inline-flex items-center gap-1">
                              <Camera size={14} /> Upload Task Completion Photo for {stage.stage_name}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-semibold">Will set progress to 100%</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-semibold text-gray-700 mb-1">Select Inspection Photo *</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => setStageFile(e.target.files[0])}
                                className="w-full text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 mb-1">Inspection Observation / Notes</label>
                              <input
                                type="text"
                                placeholder="e.g. Curing cleared, rebar cover verified"
                                value={stageNotes}
                                onChange={e => setStageNotes(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                              type="button"
                              onClick={() => setActiveStageUpdate(null)}
                              className="px-3 py-1.5 rounded-lg border text-xs text-gray-600 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={updatingStage}
                              onClick={() => handleCompleteStageInline(stage)}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow transition-transform active:scale-95 disabled:opacity-50"
                              style={{ background: 'var(--green-deep)' }}
                            >
                              {updatingStage ? 'Saving...' : 'Confirm Completed & Upload Photo'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Process / Milestone Form */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Settings size={18} className="text-emerald-800" />
                <h3 className="text-base font-bold text-gray-900">Add Custom Phase / Process Milestone</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                If site work includes a special process other than the standard 11 stages (e.g. Under-reamed pile test, solar canopy installation, structural retrofitting), record it with photo verification here.
              </p>

              <form onSubmit={handleAddCustomMilestone} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-end">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Process / Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Under-reamed pile load testing"
                    value={customMilestone.title}
                    onChange={e => setCustomMilestone({ ...customMilestone, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description &amp; Observation</label>
                  <input
                    type="text"
                    placeholder="e.g. Dial gauge deflection 1.2mm under 20T"
                    value={customMilestone.description}
                    onChange={e => setCustomMilestone({ ...customMilestone, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-[var(--green-mid)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Attach Verification Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setCustomMilestone({ ...customMilestone, file: e.target.files[0] })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submittingCustom}
                    className="w-full py-2.5 rounded-xl text-white font-bold transition-transform active:scale-95 disabled:opacity-50"
                    style={{ background: 'var(--green-deep)' }}
                  >
                    {submittingCustom ? 'Recording...' : '+ Record Custom Milestone'}
                  </button>
                </div>
              </form>
            </div>

            {/* Integrated Site Inspection & Task Completion Photo Gallery */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Site Inspection &amp; Task Completion Photo Gallery
                  </h3>
                  <p className="text-xs text-gray-500">
                    Permanent audit gallery of task completion photos uploaded across milestones.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                  {siteImages.length} Photos Stored
                </span>
              </div>

              {siteImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  <Camera size={36} className="mx-auto mb-2 text-gray-400" />
                  No photos uploaded yet. Complete a milestone above or add a custom task to store verification photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {siteImages.map(img => {
                    const fullImgUrl = img.image_url?.startsWith('http') ? img.image_url : `${BASE_URL}${img.image_url}`;
                    return (
                      <div key={img.image_id} className="rounded-xl border overflow-hidden bg-gray-50 hover:shadow-md transition-shadow group">
                        <div className="h-44 bg-gray-200 overflow-hidden relative">
                          <img
                            src={fullImgUrl}
                            alt={img.caption || 'Inspection Photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { e.target.src = 'https://placehold.co/400x300?text=Site+Inspection'; }}
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-sm">
                            {img.stage_name || 'Task Photo'}
                          </span>
                        </div>
                        <div className="p-3 text-xs">
                          <p className="font-bold text-gray-800 line-clamp-1">{img.caption || 'Site Photo'}</p>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                            <span>{img.uploaded_by || 'Site Architect'}</span>
                            <span>{img.created_at?.split('T')[0]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress Activity Log */}
            {progressLogs.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Chronological Milestone Activity Log
                </h3>
                <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto pr-1">
                  {progressLogs.map(log => (
                    <div key={log.log_id} className="p-3 rounded-xl border bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{log.stage_name}</span>
                        <p className="text-gray-600 text-[11px] mt-0.5">{log.log_notes}</p>
                      </div>
                      <div className="text-right text-[10px] text-gray-400">
                        <span className="font-semibold text-emerald-700 block">{log.status}</span>
                        <span>{log.created_at?.split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
