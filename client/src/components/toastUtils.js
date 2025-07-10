import { toast } from 'react-toastify';

export const showSuccess = (msg) => toast.success(msg, { position: 'top-right', autoClose: 2000 });
export const showError = (msg) => toast.error(msg, { position: 'top-right', autoClose: 2000 });
export const showInfo = (msg) => toast.info(msg, { position: 'top-right', autoClose: 2000 }); 