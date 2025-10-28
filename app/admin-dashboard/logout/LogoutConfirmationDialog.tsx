import React from 'react';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: (confirmed: boolean) => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = 
({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '400px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to exit?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => onClose(false)}
            style={{ 
              marginRight: '8px', 
              padding: '8px 16px', 
              borderRadius: '4px' 
            }}
          >
            No
          </button>
          <button
            onClick={() => onClose(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#4361ee',
              color: '#fff',
              border: 'none'
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationDialog;
