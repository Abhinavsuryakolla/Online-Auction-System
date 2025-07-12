import { toast } from 'react-toastify';

export const showSuccess = (msg) => toast.success(msg, { position: 'top-right', autoClose: 2000 });
export const showError = (msg) => toast.error(msg, { position: 'top-right', autoClose: 2000 });
export const showInfo = (msg) => toast.info(msg, { position: 'top-right', autoClose: 2000 }); 

export const showToast = (message, type = 'info') => {
  const options = { position: 'top-right', autoClose: 2000 };
  
  switch (type) {
    case 'success':
      return toast.success(message, options);
    case 'error':
      return toast.error(message, options);
    case 'warning':
      return toast.warning(message, options);
    case 'info':
    default:
      return toast.info(message, options);
  }
}; 