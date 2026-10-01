import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidePill } from './SlidePill';

function isActivePath(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function routeOrder(pathname, items) {
  const index = items.findIndex((item) => isActivePath(pathname, item.path));
  return index === -1 ? items.length : index;
}

function PageSlide({ items, children }) {
  const { pathname } = useLocation();
  const prev = useRef(pathname);
  const [dir, setDir] = useState('');

  useEffect(() => {
    if (prev.current === pathname) return undefined;
    const forward = routeOrder(pathname, items) >= routeOrder(prev.current, items);
    prev.current = pathname;
    setDir('');
    const frame = window.requestAnimationFrame(() => {
      setDir(forward ? 'page-slide-right' : 'page-slide-left');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, items]);

  return <div className={dir ? `page-slide ${dir}` : undefined}>{children}</div>;
}

function MoreLink({ item, active, onClick }) {
  const icon = item.icon
    ? React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`more-link${active ? ' is-on' : ''}`}
    >
      {icon}
      <span>{item.label}</span>
    </button>
  );
}

/**
 * Top pill from their TopNav, phone tab bar from their TabBar.
 * Every existing Fluvion destination stays in the desktop links or «Ещё».
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
  const dockMatch = dockItems.find((item) => isActivePath(location.pathname, item.path));
  const activeTab = dockMatch ? dockMatch.path : 'more';

  const go = (path) => {
    navigate(path);
    setMoreOpen(false);
  };

  return (
    <div className="scene">
      <header className="nav glass">
        <button type="button" className="nav-brand" onClick={() => go('/')}>
          <img src="/logo.png" alt="" />
          <span>Fluvion</span>
        </button>
        <nav className="nav-links" aria-label="Разделы">
          {navItems.map((item) => {
            const active = isActivePath(location.pathname, item.path);
            return (
              <button
                key={item.path}
                type="button"
                className={active ? 'is-on' : ''}
                aria-current={active ? 'page' : undefined}
                onClick={() => go(item.path)}
              >
                {item.tabLabel || item.label}
              </button>
            );
          })}
        </nav>
        <div className="nav-tools">
          {headerRight}
          {sidebarFooter ? <div className="nav-logout">{sidebarFooter}</div> : null}
        </div>
      </header>

      <main>
        <PageSlide items={navItems}>{children}</PageSlide>
      </main>

      <nav className="tabbar glass" aria-label="Разделы">
        <SlidePill active={activeTab}>
          {dockItems.map((item) => {
            const on = item.path === activeTab;
            return (
              <button
                key={item.path}
                type="button"
                data-tab={item.path}
                className={`card-hit ${on ? 'tab-on' : 'tab-off'}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => go(item.path)}
              >
                {item.tabLabel || item.label.split(/[\s/]/)[0]}
              </button>
            );
          })}
          <button
            type="button"
            data-tab="more"
            className={`card-hit ${activeTab === 'more' ? 'tab-on' : 'tab-off'}`}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
          >
            Ещё
          </button>
        </SlidePill>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              type="button"
              className="more-backdrop"
              aria-label="Закрыть меню"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <div className="more-sheet glass" role="dialog" aria-label="Все разделы">
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                {resolvedGroups.map((group) => {
                  const items = group.paths
                    .map((path) => navItems.find((item) => item.path === path))
                    .filter(Boolean);
                  if (items.length === 0) return null;
                  return (
                    <div className="more-group" key={group.title}>
                      <h2>{group.title}</h2>
                      <ul>
                        {items.map((item) => (
                          <li key={item.path}>
                            <MoreLink
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
                {sidebarFooter ? <div className="more-foot">{sidebarFooter}</div> : null}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <a
        href="https://t.me/FLUVIONN"
        target="_blank"
        rel="noopener noreferrer"
        className="n-fab"
        aria-label="Telegram канал FLUVION"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.169 1.858-.896 6.375-1.268 8.451-.162.894-.479 1.192-.787 1.222-.69.062-1.214-.456-1.883-.893-1.046-.692-1.638-1.123-2.654-1.799-1.251-.844-.44-1.309.274-2.067.186-.193 3.405-3.123 3.471-3.391.008-.031.015-.147-.057-.208-.072-.061-.178-.038-.256-.023-.109.019-1.843 1.175-5.202 3.45-.493.348-.939.517-1.34.509-.443-.01-1.295-.25-1.927-.458-.776-.257-1.392-.392-1.338-.828.027-.218.405-.442 1.113-.671 4.318-1.874 7.205-3.11 8.659-3.708 4.078-1.668 4.921-1.959 5.474-1.977.122-.004.396-.029.573.216.138.192.096.44.056.606z" />
        </svg>
      </a>
    </div>
  );
}
