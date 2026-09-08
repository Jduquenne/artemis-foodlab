import { useState } from 'react';
import { useNavigate, useLocation, type To } from 'react-router-dom';

export const useModalBack = (fallback: To, delay = 280) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeaving, setIsLeaving] = useState(false);

  const goBack = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (location.key === 'default') {
        navigate(fallback, { replace: true });
      } else {
        navigate(-1);
      }
    }, delay);
  };

  return { isLeaving, goBack };
};
