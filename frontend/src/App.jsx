/**
 * Main Application Component and Route Setup
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import GenerationForm from './pages/GenerationForm';
import AgreementPreview from './pages/AgreementPreview';
import ValidationPage from './pages/ValidationPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<GenerationForm />} />
          <Route path="/preview/:agreementId" element={<AgreementPreview />} />
          <Route path="/validate" element={<ValidationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
