import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../Pages/Home';
import CostEstimation from '../Pages/CostEstimation';
import Results from '../Pages/Results';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cost-estimation" element={<CostEstimation />} />
      <Route path="/cost-estimation/results" element={<Results />} />
      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
