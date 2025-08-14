import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FormProvider } from './context/FormContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import FormRenderer from './pages/FormRenderer';
import FormResponses from './pages/FormResponses';

function App() {
  return (
    <FormProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder" element={<FormBuilder />} />
              <Route path="/builder/:id" element={<FormBuilder />} />
              <Route path="/preview/:id" element={<FormPreview />} />
              <Route path="/form/:id" element={<FormRenderer />} />
              <Route path="/responses/:id" element={<FormResponses />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </FormProvider>
  );
}

export default App;
