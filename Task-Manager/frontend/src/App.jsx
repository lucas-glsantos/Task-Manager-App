import { Route, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import TaskDetailPage from "./pages/TaskDetailPage";

const App = () => {
  return (
    <div className="min-h-screen w-full" data-theme="dim">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/task/:id" element={<TaskDetailPage />} />
      </Routes>
    </div>
  );
};
export default App;