import React, { useState, useEffect } from 'react';
import { Phone, Mic, Grid, Volume2, Plus, Pause, RefreshCcw, Circle, Video, MoreHorizontal } from 'lucide-react';

const CallInterface = ({ patient, onEndCall }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '50%',
    padding: '12px',
    width: '70px',
    height: '70px',
    margin: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '320px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{patient.name}</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>{formatDuration(duration)}</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: Mic, label: 'Mute' },
            { icon: Grid, label: 'Keypad' },
            { icon: Volume2, label: 'Audio' },
            { icon: Plus, label: 'Add Call' },
            { icon: Pause, label: 'Hold' },
            { icon: RefreshCcw, label: 'Transfer' },
            { icon: Circle, label: 'Record' },
            { icon: Video, label: 'Meet' },
            { icon: MoreHorizontal, label: 'More' }
          ].map((item, index) => (
            <button key={index} style={buttonStyle}>
              <item.icon style={{ width: '24px', height: '24px', marginBottom: '4px', color: '#333' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>{item.label}</span>
            </button>
          ))}
        </div>
        
        <button 
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '50%',
            padding: '16px',
            border: 'none',
            cursor: 'pointer',
            display: 'block',
            margin: '0 auto',
            transition: 'background-color 0.3s',
          }}
          onClick={onEndCall}
        >
          <Phone style={{ width: '24px', height: '24px', transform: 'rotate(135deg)' }} />
        </button>
      </div>
    </div>
  );
};

export default CallInterface;