import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} className="modal-icon success" />;
      case 'warning':
        return <AlertTriangle size={48} className="modal-icon warning" />;
      default:
        return <AlertTriangle size={48} className="modal-icon" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-body">
          {getIcon()}
          
          <h2 className="modal-title">{title}</h2>
          
          {message && <p className="modal-message">{message}</p>}
          
          <div className="modal-actions">
            {type === 'confirm' && (
              <>
                <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                  {cancelText}
                </button>
                <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                  {confirmText}
                </button>
              </>
            )}
            
            {type === 'alert' && (
              <button className="modal-btn modal-btn-confirm" onClick={onClose}>
                OK
              </button>
            )}
            
            {type === 'success' && (
              <button className="modal-btn modal-btn-confirm" onClick={onClose}>
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
