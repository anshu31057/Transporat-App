import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import DashboardPage from '../pages/DashboardPage';
import NewEntryPage from '../pages/NewEntryPage';
import EntryListPage from '../pages/EntryListPage';
import EntryDetailPage from '../pages/EntryDetailPage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/LoginPage';
import ExportReportPage from '../pages/ExportReportPage';
import EditEntryPage from '../pages/EditEntryPage';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { role } = useAuth();
  const target = role === 'admin' ? '/admin/dashboard' : '/owner/dashboard';
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route element={<RoleBasedRoute allowedRoles={['owner']} redirectTo="/admin/dashboard" />}>
            <Route path="owner/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<RoleBasedRoute allowedRoles={['admin']} redirectTo="/owner/dashboard" />}>
            <Route path="admin/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="entries" element={<EntryListPage />} />
          <Route path="entries/:entryId" element={<EntryDetailPage />} />
          <Route element={<RoleBasedRoute allowedRoles={['owner']} redirectTo="/dashboard" />}>
            <Route path="export" element={<ExportReportPage />} />
          </Route>
          <Route element={<RoleBasedRoute allowedRoles={['admin']} redirectTo="/dashboard" />}>
            <Route path="new-entry" element={<NewEntryPage />} />
            <Route path="entries/edit/:entryId" element={<EditEntryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
