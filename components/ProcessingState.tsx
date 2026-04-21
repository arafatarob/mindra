'use client';
import React, { useState, useEffect } from 'react';

interface ProcessingLog {
  msg: string;
  time: string;
}

interface ProcessingStateProps {
  formData: {
    industry: string;
    location: string;
    companySize: string;
    volume: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export default function ProcessingState({
  formData,
  onComplete,
  onCancel
}: ProcessingStateProps) {
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState({ scanning: 0, enriching: 0, verifying: 0 });
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addLog = (msg: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev, { msg, time }]);
  };

  useEffect(() => {
    // Initialize
    addLog(`Starting search for ${formData.industry} companies with ${formData.companySize} employees in ${formData.location}`);
    addLog('Scanning social profiles and business directories...');

    // Stage 1: Scanning
    const scanInterval = setInterval(() => {
      setProgress(prev => {
        if (prev.scanning < 100) {
          return { ...prev, scanning: prev.scanning + 5 };
        }
        return prev;
      });
    }, 150);

    // After 3 seconds, start enriching
    const enrichTimeout = setTimeout(() => {
      clearInterval(scanInterval);
      addLog('✓ Scanning complete. Found relevant business profiles.');
      addLog('Now enriching contact information...');
      
      const enrichInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.enriching < 100) {
            return { ...prev, enriching: prev.enriching + 4 };
          }
          return prev;
        });
      }, 180);

      // After 6 seconds, start verifying
      const verifyTimeout = setTimeout(() => {
        clearInterval(enrichInterval);
        addLog('✓ Contact enrichment complete. Validating email addresses...');
        addLog('Verifying lead quality and scoring...');
        
        const verifyInterval = setInterval(() => {
          setProgress(prev => {
            if (prev.verifying < 100) {
              return { ...prev, verifying: prev.verifying + 4 };
            }
            return prev;
          });
        }, 180);

        // After 10 seconds, finish
        const completeTimeout = setTimeout(() => {
          clearInterval(verifyInterval);
          setProgress({ scanning: 100, enriching: 100, verifying: 100 });
          addLog(`✓ Processing complete! ${formData.volume} verified leads ready for export.`);
          setIsComplete(true);
          
          // Auto complete after 2 seconds
          setTimeout(onComplete, 2000);
        }, 5400);

        return () => clearTimeout(completeTimeout);
      }, 5400);

      return () => clearTimeout(verifyTimeout);
    }, 3000);

    // Timer interval
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(timerInterval);
      clearTimeout(enrichTimeout);
    };
  }, [formData, onComplete]);

  const STAGES = [
    { key: 'scanning', label: 'Scanning sources', progress: progress.scanning },
    { key: 'enriching', label: 'Enriching contacts', progress: progress.enriching },
    { key: 'verifying', label: 'Verifying & scoring', progress: progress.verifying },
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Processing Card */}
      <div className="processing">
        <div className="proc-header">
          <span className="proc-label">PROCESSING YOUR LEADS</span>
          <span className="proc-timer">
            {timer}s
          </span>
        </div>
        <div className="proc-title" style={{ marginBottom: '24px' }}>
          Ready when you are
        </div>

        {STAGES.map((stage, idx) => (
          <div key={stage.key} className="proc-item" style={{ marginBottom: idx === STAGES.length - 1 ? 0 : '18px' }}>
            <div className="proc-row">
              <div className="proc-name">
                <div
                  className={`proc-dot ${
                    stage.progress > 0 ? 'running' : ''
                  } ${stage.progress === 100 ? 'done' : ''}`}
                ></div>
                {stage.label}
              </div>
              <div
                className={`proc-pct ${stage.progress === 100 ? 'done' : ''}`}
              >
                {stage.progress}%
              </div>
            </div>
            <div className="proc-bar-track">
              <div
                className={`proc-bar-fill ${stage.progress === 100 ? 'done' : ''}`}
                style={{ width: `${stage.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="activity" style={{ marginTop: '16px' }}>
        <div className="act-header">
          <span className="act-label">Activity Feed</span>
          <span className="act-status" style={{ color: isComplete ? 'var(--green)' : 'var(--accent)' }}>
            {isComplete ? 'Complete' : 'Live'}
          </span>
        </div>
        <div className="act-log" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {logs.length > 0 ? (
            logs.map((log, i) => (
              <div key={i} className="act-line">
                <span className="act-arrow">›</span>
                <span>{log.msg}</span>
                <span className="act-time">{log.time}</span>
              </div>
            ))
          ) : (
            <div className="act-empty">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: '#4A4E62' }}
              >
                <circle cx="7" cy="7" r="6" />
                <line x1="7" y1="4" x2="7" y2="7" />
                <circle cx="7" cy="9.5" r=".5" fill="currentColor" stroke="none" />
              </svg>
              No activity yet
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {isComplete && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            ← New Search
          </button>
          <button className="btn btn-primary" onClick={onComplete}>
            View Results →
          </button>
        </div>
      )}
    </div>
  );
}
