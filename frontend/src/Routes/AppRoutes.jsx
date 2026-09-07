import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../Pages/Home';
import CostEstimation from '../Pages/CostEstimation';
import Results from '../Pages/Results';
import Recommendations from '../Pages/Recommendations';
import ProjectsList from '../Pages/ProjectsList';
import ArchitectDashboard from '../Pages/ArchitectDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectsList />} />
      <Route path="/architect" element={<ProjectsList />} />
      <Route path="/architect/:projectId" element={<ArchitectDashboard />} />
      <Route path="/cost-estimation" element={<CostEstimation />} />
      <Route path="/cost-estimation/results" element={<Results />} />
      <Route path="/recommendations" element={<Recommendations />} />
      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
