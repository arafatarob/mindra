'use client';
import React, { useState } from 'react';

interface FormData {
  industry: string;
  location: string;
  companySize: string;
  volume: string;
}

interface LeadGenerationFormProps {
  onProcessingStart: (data: FormData) => void;
}

export default function LeadGenerationForm({ onProcessingStart }: LeadGenerationFormProps) {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    industry: '',
    location: '',
    companySize: '',
    volume: '25',
  });

  const LOCATIONS = [
    { flag: '🇺🇸', name: 'United States' },
    { flag: '🇬🇧', name: 'United Kingdom' },
    { flag: '🇨🇦', name: 'Canada' },
    { flag: '🇦🇺', name: 'Australia' },
    { flag: '🇦🇪', name: 'UAE / Dubai' },
    { flag: '🇧🇩', name: 'Bangladesh' },
    { flag: '🇩🇪', name: 'Germany' },
    { flag: '🇫🇷', name: 'France' },
    { flag: '🇮🇳', name: 'India' },
  ];

  const handleNext = () => {
    if (formStep === 1 && !formData.industry.trim()) return;
    if (formStep === 2 && !formData.location) return;
    if (formStep === 3 && !formData.companySize) return;
    
    if (formStep < 3) {
      setFormStep(formStep + 1);
    } else if (formStep === 3) {
      onProcessingStart(formData);
    }
  };

  const handleBack = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'var(--tx)' }}>
          Find your first leads
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--tx2)' }}>
          Start with 25 free leads. No setup needed.
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="wizard">
        <div className="step-header">
          <span className="step-tag">Step {formStep} of 3</span>
          <div className="step-dots">
            <div className={`step-dot ${formStep >= 1 ? (formStep === 1 ? 'active' : 'done') : ''}`}></div>
            <div className={`step-dot ${formStep >= 2 ? (formStep === 2 ? 'active' : 'done') : ''}`}></div>
            <div className={`step-dot ${formStep === 3 ? 'active' : ''}`}></div>
          </div>
        </div>

        {/* STEP 1: What are you looking for? */}
        {formStep === 1 && (
          <div className="step-pane active">
            <div className="step-q">What are you looking for?</div>
            <div className="field">
              <div className="field-label">Type of business</div>
              <input
                className="field-input"
                placeholder="e.g. restaurants, gyms"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
            <div className="btn-row">
              <div style={{ flex: 1 }}></div>
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!formData.industry.trim()}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select location */}
        {formStep === 2 && (
          <div className="step-pane active">
            <div className="step-q">Where should we look?</div>
            <div className="field-label" style={{ marginBottom: '16px' }}>Select region</div>
            <div className="loc-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '32px' }}>
              {LOCATIONS.map(loc => (
                <div
                  key={loc.name}
                  className={`loc-card ${formData.location === loc.name ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, location: loc.name }))}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="loc-flag">{loc.flag}</div>
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <div style={{ fontWeight: 500 }}>{loc.name}</div>
                  </div>
                  <div className="loc-check">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1.5 5 4 7.5 8.5 2.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn-back-step" onClick={handleBack}>← Back</button>
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!formData.location}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: How many leads? */}
        {formStep === 3 && (
          <div className="step-pane active">
            <div className="step-q">How many leads do you need?</div>
            <div className="vol-grid">
              {[
                { value: '25', num: '25', label: 'Free · try it out' },
                { value: '100', num: '100', label: 'Starter · most popular' },
                { value: '300', num: '300', label: 'Pro · power users' },
              ].map(vol => (
                <div
                  key={vol.value}
                  className={`vol-card ${formData.volume === vol.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, volume: vol.value }))}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="vol-num">{vol.num}</div>
                  <div className="vol-lbl">{vol.label}</div>
                </div>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn-back-step" onClick={handleBack}>← Back</button>
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!formData.volume}
              >
                Generate Leads
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
