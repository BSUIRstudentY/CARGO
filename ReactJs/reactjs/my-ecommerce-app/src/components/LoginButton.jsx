import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/login')}
      className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300 sm:hidden md:block"
    >
      Вход/Регистрация
    </button>
  );
}

export default LoginButton;