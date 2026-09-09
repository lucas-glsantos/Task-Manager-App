import { Route, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import TaskDetailPage from "./pages/TaskDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <div className="min-h-screen w-full" data-theme="dark">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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