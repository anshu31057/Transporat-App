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
import ExportPage from '../pages/ExportPage';
import EditEntryPage from '../pages/EditEntryPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="entries" element={<EntryListPage />} />
          <Route path="entries/:entryId" element={<EntryDetailPage />} />
          <Route path="export" element={<ExportPage />} />
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
