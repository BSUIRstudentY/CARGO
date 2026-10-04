import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'framer-motion';
import LoyaltyTab from '../components/LoyaltyTab';
import PersonalDataTab from '../components/PersonalDataTab';
import ShipmentsTab from '../components/ShipmentsTab';
import ReferralTab from '../components/ReferralTab';
import BatchCargosTab from '../components/BatchCargosTab';
import { UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageHeader } from '../components/ui/PageHeader';

function Profile() {
  const { user, logout } = useAuth();
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [activeTab, setActiveTab] = useState('personal-data');
  const [refreshTrigger] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user?.role]);

  const handleViewOrderDetails = useCallback(
    (orderId) => {
      navigate(`/order-details/${orderId}`);
    },
    [navigate]
  );


  const tabs = [
    {
      id: 'personal-data',
      label: 'Данные',
      icon: <UserIcon className="h-4 w-4 shrink-0" />,
      highlight: false,
    },
    {
      id: 'shipments',
      label: 'Заказы',
      icon: (
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M16.755 5.932h-1.99a2.56 2.56 0 0 0 .455-1.394 2.767 2.767 0 0 0-.822-2.054 2.812 2.812 0 0 0-2.07-.815 2.584 2.584 0 0 0-1.866.857 4.16 4.16 0 0 0-.46.631 4.165 4.165 0 0 0-.461-.631 2.565 2.565 0 0 0-1.866-.857 2.831 2.831 0 0 0-2.07.815 2.786 2.786 0 0 0-.823 2.054c.013.499.171.983.456 1.394h-1.99c-.408 0-1.004-.096-1.292.19-.287.285-.243.928-.243 1.332V9.89c0 .35-.143.907.081 1.179.224.272.962.242 1.309.313l-.162 4.597c0 .404.028.907.316 1.193.287.285.811.33 1.218.33h11.052c.407 0 .931-.045 1.22-.33.287-.286.315-.79.315-1.193l-.163-4.597c.347-.07 1.086-.041 1.31-.313.223-.272.081-.828.081-1.18V7.455c0-.404.044-1.047-.244-1.333-.288-.285-.884-.19-1.291-.19Zm-4.912-2.195a.736.736 0 0 1 .537-.241h.027a.976.976 0 0 1 .697.29.958.958 0 0 1 .274.7.726.726 0 0 1-.243.532c-.53.466-1.4.705-2.12.82.114-.712.355-1.576.828-2.1Zm-4.935.04a.986.986 0 0 1 .684-.281h.03a.741.741 0 0 1 .537.241c.47.525.711 1.389.825 2.102-.713-.115-1.592-.354-2.116-.82a.73.73 0 0 1-.244-.534.961.961 0 0 1 .284-.707Z" />
        </svg>
      ),
      highlight: true,
    },
    {
      id: 'batch-cargos',
      label: 'Сборные грузы',
      icon: (
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z" />
        </svg>
      ),
      highlight: true,
    },
    {
      id: 'loyalty',
      label: 'Лояльность',
      icon: (
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z" />
        </svg>
      ),
      highlight: false,
    },
    {
      id: 'referrals',
      label: 'Рефералы',
      icon: (
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z" />
        </svg>
      ),
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] pb-24 sm:pb-12 relative overflow-hidden">
      
      <div className="relative z-10">
        <PageHeader
          kicker="Аккаунт"
          title="Личный кабинет"
          subtitle="Управление вашими данными и заказами"
        />
        
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        {/* Mobile Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex sm:hidden gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={tab.id === activeTab ? 'primary' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0"
              >
                {tab.icon}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="hidden w-72 shrink-0 lg:block"
          >
            <div className="glass sheet p-3 text-[#111]">
              <p className="kicker mb-2 px-2">Кабинет</p>
              <nav>
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-left text-[13px] ${tab.id === activeTab ? 'pill-on' : 'text-[#111] hover:bg-white/70'}`}
                      >
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  ))}
                  <li className="pt-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-left text-[13px] text-[#111] hover:bg-white/70"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0" />
                      <span>Выйти</span>
                    </button>
                  </li>
                </ul>
              </nav>
              {userRole === 'ADMIN' ? (
                <button type="button" className="btn btn-light btn-sm mt-3 w-full" onClick={() => navigate('/admin')}>
                  Админ-панель
                </button>
              ) : null}
            </div>
          </motion.aside>
          
          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full min-w-0 flex-1"
          >
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              {activeTab === 'personal-data' && <PersonalDataTab setError={setError} />}
              {activeTab === 'shipments' && (
                <ShipmentsTab
                  handleViewOrderDetails={handleViewOrderDetails}
                  refresh={refreshTrigger}
                />
              )}
              {activeTab === 'batch-cargos' && (
                <BatchCargosTab
                  userEmail={user?.email}
                  handleViewOrderDetails={handleViewOrderDetails}
                  refresh={refreshTrigger}
                />
              )}
              {activeTab === 'loyalty' && <LoyaltyTab />}
              {activeTab === 'referrals' && <ReferralTab />}
            </div>
          </motion.main>
        </div>
        
        {/* Mobile FAB for Logout */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed bottom-20 sm:bottom-6 right-6 lg:hidden z-50 safe-area-bottom"
        >
          <Button
            variant="primary"
            onClick={logout}
            className="rounded-full p-4 shadow-lg"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;