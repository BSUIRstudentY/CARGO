import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

/**
 * Кнопка входа/регистрации с современным дизайном
 */
function LoginButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => navigate('/login')}
      className="hidden sm:flex"
    >
      Вход/Регистрация
    </Button>
  );
}

export default LoginButton;