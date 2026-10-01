import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

function isActivePath(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavButton({ item, active, onClick }) {
  const icon = item.icon
    ? React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`cupertino-nav-btn${active ? ' is-active' : ''}`}
    >
      {icon}
      <span className="flex-1">{item.label}</span>
    </button>
  );
}

/**
 * Storefront shell: frosted widgets on a light field.
 * Navigation is one floating dock at the bottom on every width.
 * «Ещё» opens the rest of the sections; nothing lives in a sidebar.
 */
export default function StoreChrome({
  navItems,
  groups,
  mobileTabs,
  headerRight,
  sidebarFooter,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  const resolvedGroups = useMemo(() => {
    const known = new Set(groups.flatMap((group) => group.paths));
    const leftover = navItems.filter((item) => !known.has(item.path)).map((item) => item.path);
    if (leftover.length === 0) return groups;
    return [...groups, { title: 'Разделы', paths: leftover }];
  }, [groups, navItems]);

  const dockItems = mobileTabs
    .map((path) => navItems.find((item) => item.path === path))
    .filter(Boolean);
  const dockActive = dockItems.some((item) => isActivePath(location.pathname, item.path));

  const go = (path) => {
    navigate(path);
    setMoreOpen(false);
  };

  return (
    <div className="cupertino-app">
      <div className="cupertino-top">
        <button type="button" className="cupertino-brand" onClick={() => go('/')}>
          <img src="/logo.png" alt="" />
          <span className="cupertino-brand-name">Fluvion</span>
        </button>
        {headerRight ? <div className="cupertino-top-actions">{headerRight}</div> : <span />}
      </div>

      <div className="cupertino-column">
        <div className="cupertino-main">{children}</div>
      </div>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              type="button"
              className="cupertino-more-backdrop"
              aria-label="Закрыть меню"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <div className="cupertino-more" role="dialog" aria-label="Все разделы">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            >
              {resolvedGroups.map((group) => {
                const items = group.paths
                  .map((path) => navItems.find((item) => item.path === path))
                  .filter(Boolean);
                if (items.length === 0) return null;
                return (
                  <div className="cupertino-group" key={group.title}>
                    <h2 className="cupertino-group-title">{group.title}</h2>
                    <ul className="cupertino-nav-list">
                      {items.map((item) => (
                        <li key={item.path}>
                          <NavButton
                            item={item}
                            active={isActivePath(location.pathname, item.path)}
                            onClick={() => go(item.path)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {sidebarFooter ? <div className="cupertino-more-foot">{sidebarFooter}</div> : null}
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <nav className="cupertino-dock" aria-label="Разделы">
        {dockItems.map((item) => {
          const active = isActivePath(location.pathname, item.path);
          const icon = item.icon
            ? React.cloneElement(item.icon, { className: 'w-5 h-5' })
            : null;
          return (
            <button
              key={item.path}
              type="button"
              className={`cupertino-dock-item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => go(item.path)}
            >
              {icon}
              <span>{item.tabLabel || item.label.split(/[\s/]/)[0]}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={`cupertino-dock-item${!dockActive && moreOpen ? ' is-active' : ''}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
          <span>Ещё</span>
        </button>
      </nav>

      <a
        href="https://t.me/FLUVIONN"
        target="_blank"
        rel="noopener noreferrer"
        className="cupertino-fab"
        aria-label="Telegram канал FLUVION"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.169 1.858-.896 6.375-1.268 8.451-.162.894-.479 1.192-.787 1.222-.69.062-1.214-.456-1.883-.893-1.046-.692-1.638-1.123-2.654-1.799-1.251-.844-.44-1.309.274-2.067.186-.193 3.405-3.123 3.471-3.391.008-.031.015-.147-.057-.208-.072-.061-.178-.038-.256-.023-.109.019-1.843 1.175-5.202 3.45-.493.348-.939.517-1.34.509-.443-.01-1.295-.25-1.927-.458-.776-.257-1.392-.392-1.338-.828.027-.218.405-.442 1.113-.671 4.318-1.874 7.205-3.11 8.659-3.708 4.078-1.668 4.921-1.959 5.474-1.977.122-.004.396-.029.573.216.138.192.096.44.056.606z" />
        </svg>
      </a>
    </div>
  );
}
