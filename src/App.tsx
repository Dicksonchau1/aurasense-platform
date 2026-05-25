import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WoundDressingPage from "./pages/WoundDressingPage";
// ...existing imports

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ...existing routes */}
        <Route path="/rehearse/wound-dressing" element={<WoundDressingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
