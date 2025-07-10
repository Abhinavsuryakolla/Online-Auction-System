import { useState } from 'react';

export function useForm(initial) {
  const [form, setForm] = useState(initial);
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  const reset = () => setForm(initial);
  return [form, handleChange, reset, setForm];
} 