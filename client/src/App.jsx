import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/TaskCreatePage";
import TaskDetailPage from "./pages/TaskDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import { PublicRoute, ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <div className="min-h-screen w-full" data-theme="light">
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>} />

        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/task/:id" 
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};
export default App;