import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public & Architect Pages
import Home from '../Pages/Home';
import CostEstimation from '../Pages/CostEstimation';
import Results from '../Pages/Results';
import Recommendations from '../Pages/Recommendations';
import ProjectsList from '../Pages/ProjectsList';
import ArchitectDashboard from '../Pages/ArchitectDashboard';
import Login from '../Pages/Login';

// Auth Guard
import ProtectedRoute from '../Components/ProtectedRoute';

// Super Admin Module
import AdminLayout from '../Pages/Admin/AdminLayout';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import AdminArchitects from '../Pages/Admin/AdminArchitects';
import AdminProjects from '../Pages/Admin/AdminProjects';
import AdminCustomers from '../Pages/Admin/AdminCustomers';
import AdminPlans from '../Pages/Admin/AdminPlans';
import AdminUsage from '../Pages/Admin/AdminUsage';

// Customer Module
import CustomerLayout from '../Pages/Customer/CustomerLayout';
import CustomerDashboard from '../Pages/Customer/CustomerDashboard';
import CustomerProject from '../Pages/Customer/CustomerProject';
import CustomerMaterials from '../Pages/Customer/CustomerMaterials';
import CustomerCost from '../Pages/Customer/CustomerCost';
import CustomerSustainability from '../Pages/Customer/CustomerSustainability';
import CustomerProgress from '../Pages/Customer/CustomerProgress';
import CustomerPhotos from '../Pages/Customer/CustomerPhotos';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public & Authentication Routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ── Architect Workspace Routes (Protected for Architects & Super Admins) ── */}
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

      {/* ── Auxiliary Architect Calculators ── */}
      <Route path="/cost-estimation" element={<CostEstimation />} />
      <Route path="/cost-estimation/results" element={<Results />} />
      <Route path="/recommendations" element={<Recommendations />} />

      {/* ── Super Admin Portal Routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="architects" element={<AdminArchitects />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="usage" element={<AdminUsage />} />
      </Route>

      {/* ── Customer Portal Routes ── */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'SUPER_ADMIN']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="project" element={<CustomerProject />} />
        <Route path="materials" element={<CustomerMaterials />} />
        <Route path="cost" element={<CustomerCost />} />
        <Route path="sustainability" element={<CustomerSustainability />} />
        <Route path="progress" element={<CustomerProgress />} />
        <Route path="photos" element={<CustomerPhotos />} />
      </Route>

      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
