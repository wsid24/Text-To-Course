import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Auth0's hosted signup page handles all registration. We just bounce
 * users into the Auth0 flow with `screen_hint=signup` and let it return.
 */
export default function RegisterPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      signup();
    }
  }, [isAuthenticated, signup, navigate]);

  return null;
}
