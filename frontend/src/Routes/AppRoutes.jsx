import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

/* ── Loading state ── */
import BrandedLoader from '../Components/BrandedLoader';

/* ── Public Pages ── */
import LandingPage    from '../Pages/LandingPage';
import AboutUs        from '../Pages/AboutUs';
import GetStarted     from '../Pages/GetStarted';
import ContactUs      from '../Pages/ContactUs';
import Login          from '../Pages/Login';
import NotFound       from '../Pages/NotFound';

/* ── Architect Pages ── */
import CostEstimation    from '../Pages/CostEstimation';
import Results           from '../Pages/Results';
import Recommendations   from '../Pages/Recommendations';
import ProjectsList      from '../Pages/ProjectsList';
import ArchitectDashboard from '../Pages/ArchitectDashboard';

/* ── Admin Pages ── */
import AdminLayout    from '../Pages/Admin/AdminLayout';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import AdminArchitects from '../Pages/Admin/AdminArchitects';
import AdminProjects  from '../Pages/Admin/AdminProjects';
import AdminCustomers from '../Pages/Admin/AdminCustomers';
import AdminPlans     from '../Pages/Admin/AdminPlans';
import AdminUsage     from '../Pages/Admin/AdminUsage';

/* ── Customer Pages ── */
import CustomerLayout        from '../Pages/Customer/CustomerLayout';
import CustomerDashboard     from '../Pages/Customer/CustomerDashboard';
import CustomerProject       from '../Pages/Customer/CustomerProject';
import CustomerMaterials     from '../Pages/Customer/CustomerMaterials';
import CustomerCost          from '../Pages/Customer/CustomerCost';
import CustomerSustainability from '../Pages/Customer/CustomerSustainability';
import CustomerProgress      from '../Pages/Customer/CustomerProgress';
import CustomerPhotos        from '../Pages/Customer/CustomerPhotos';

/* ── Profile ── */
import Profile from '../Pages/Profile';

/* ── Guards ── */
import ProtectedRoute  from '../Components/ProtectedRoute';
import PublicOnlyRoute from '../Components/PublicOnlyRoute';

const PageLoader = () => (
  <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
    <BrandedLoader size="md" message="Loading..." />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/about"       element={<AboutUs />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/contact"     element={<ContactUs />} />

        {/* ── Auth Routes ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* /register is no longer available — accounts are admin-created */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* ── Profile (all authenticated roles) ── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN', 'CUSTOMER']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ── Architect Workspace ── */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <ProjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/architect"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <ProjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/architect/:projectId"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <ArchitectDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-estimation"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <CostEstimation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-estimation/results"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute allowedRoles={['ARCHITECT', 'SUPER_ADMIN']}>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        {/* ── Super Admin Portal ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />
          <Route path="architects" element={<AdminArchitects />} />
          <Route path="projects"   element={<AdminProjects />} />
          <Route path="customers"  element={<AdminCustomers />} />
          <Route path="plans"      element={<AdminPlans />} />
          <Route path="usage"      element={<AdminUsage />} />
        </Route>

        {/* ── Customer Portal ── */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SUPER_ADMIN']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<CustomerDashboard />} />
          <Route path="project"       element={<CustomerProject />} />
          <Route path="materials"     element={<CustomerMaterials />} />
          <Route path="cost"          element={<CustomerCost />} />
          <Route path="sustainability" element={<CustomerSustainability />} />
          <Route path="progress"      element={<CustomerProgress />} />
          <Route path="photos"        element={<CustomerPhotos />} />
        </Route>

        {/* ── 404 Catch-all ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
