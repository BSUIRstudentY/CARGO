import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SlidePill } from './SlidePill';
import { useCart } from './CartContext';
import { useAuth } from './AuthProvider';

function isActivePath(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function MoreLink({ item, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`more-link${active ? ' is-on' : ''}`}>
      {item.label}
    </button>
  );
}

/**
 * Chrome from cargo/components/Chrome.tsx.
 * Every Fluvion destination stays in the scrolling nav or the phone «Ещё» sheet.
 */
export default function StoreChrome({
  navItems,
  groups,
  mobileTabs,
  sidebarFooter,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const navScrollRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const cartCount = Array.isArray(cart) ? cart.length : 0;

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

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

  useLayoutEffect(() => {
    const el = navScrollRef.current;
    if (!el) return undefined;
    let frame = 0;
    const align = () => {
      const nav = el.parentElement;
      const brand = nav?.querySelector('.nav-brand');
      const tools = nav?.querySelector('.nav-tools');
      if (!nav || !brand || !tools) return;
      const style = getComputedStyle(nav);
      const gap = parseFloat(style.columnGap || style.gap) || 0;
      const available = nav.clientWidth
        - (parseFloat(style.paddingLeft) || 0)
        - (parseFloat(style.paddingRight) || 0)
        - brand.offsetWidth
        - tools.offsetWidth
        - gap * 2;
      const links = [...el.querySelectorAll('.nav-link')];
      if (!links.length || available <= 0) return;
      const origin = el.getBoundingClientRect().left;
      const slNow = el.scrollLeft;
      const items = links.map((link) => {
        const rect = link.getBoundingClientRect();
        const start = rect.left - origin + slNow;
        return { start, end: start + rect.width };
      });
      const contentWidth = items[items.length - 1].end;
      let anchor = items[0].start;
      for (const item of items) {
        if (item.start <= slNow + 1) anchor = item.start;
      }
      let suffix = items[items.length - 1].start;
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (contentWidth - items[i].start <= available + 0.5) suffix = items[i].start;
      }
      if (slNow >= suffix - 1) anchor = suffix;
      let end = anchor;
      let fitted = false;
      for (const item of items) {
        if (item.start >= anchor - 0.5 && item.end <= anchor + available + 0.5) {
          end = item.end;
          fitted = true;
        }
      }
      const next = Math.round(Math.min(available, Math.max(fitted ? end - anchor : available, 48)));
      const width = `${next}px`;
      el.style.flex = '0 0 auto';
      if (el.style.width !== width) el.style.width = width;
      if (Math.abs(el.scrollLeft - anchor) > 1) el.scrollLeft = anchor;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    };
    let scrollTimer = 0;
    const onScroll = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(align, 140);
    };
    align();
    const observer = new ResizeObserver(schedule);
    observer.observe(el.parentElement);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
      observer.disconnect();
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
    };
  }, [navItems, isAuthenticated]);

  return (
    <div className="scene">
      <div className="backdrop" aria-hidden>
        <img src="/images/bg-blur.jpg" alt="" />
        <div className="backdrop-veil" />
      </div>

      <header className="nav glass">
        <button type="button" className="nav-brand" onClick={() => go('/')}>
          <img src="/logo.png" alt="" />
          <span>Fluvion</span>
        </button>
        <nav className="nav-scroll" aria-label="Разделы" ref={navScrollRef}>
          {navItems.map((item) => {
            const on = isActivePath(location.pathname, item.path);
            return (
              <button
                key={item.path}
                type="button"
                className={`nav-link${on ? ' is-on' : ''}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => go(item.path)}
              >
                {item.tabLabel || item.label}
              </button>
            );
          })}
        </nav>
        <div className="nav-tools">
          {isAuthenticated ? (
            <button type="button" className="nav-icon" aria-label="Уведомления" onClick={() => go('/notifications')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          ) : null}
          <button type="button" className="nav-icon" aria-label={cartCount ? `Корзина, ${cartCount}` : 'Корзина'} onClick={() => go(isAuthenticated ? '/cart' : '/login')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.5 8h11l-.7 9.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6.5 8Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 8V6.6A3 3 0 0 1 12 3.6 3 3 0 0 1 15 6.6V8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {cartCount ? <span className="nav-badge">{cartCount > 9 ? '9+' : cartCount}</span> : null}
          </button>
          <button type="button" className={`nav-cta ml-1${isAuthenticated ? ' nav-cta-account' : ''}`} onClick={() => go(isAuthenticated ? '/profile' : '/login')}>
            {isAuthenticated ? 'Профиль' : 'Войти'}
          </button>
          {sidebarFooter ? <div className="ml-1 hidden sm:block">{sidebarFooter}</div> : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[980px] px-3 pb-28 pt-6 sm:px-5 sm:pb-10">
        {children}
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
                className={`tab${on ? ' is-on' : ''}`}
                onClick={() => go(item.path)}
              >
                {item.tabLabel || item.label.split(/[\s/]/)[0]}
                {item.path === '/cart' && cartCount ? <span className="tab-count">{cartCount}</span> : null}
              </button>
            );
          })}
          <button
            type="button"
            data-tab="more"
            className={`tab${activeTab === 'more' ? ' is-on' : ''}`}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
          >
            Ещё
          </button>
        </SlidePill>
      </nav>

      {moreOpen ? (
        <>
          <button type="button" className="more-backdrop" aria-label="Закрыть меню" onClick={() => setMoreOpen(false)} />
          <div className="more-sheet glass" role="dialog" aria-label="Все разделы">
            {resolvedGroups.map((group) => {
              const items = group.paths
                .map((path) => navItems.find((item) => item.path === path))
                .filter(Boolean);
              if (!items.length) return null;
              return (
                <div key={group.title} className="py-1">
                  <p className="kicker px-3 py-1">{group.title}</p>
                  {items.map((item) => (
                    <MoreLink
                      key={item.path}
                      item={item}
                      active={isActivePath(location.pathname, item.path)}
                      onClick={() => go(item.path)}
                    />
                  ))}
                </div>
              );
            })}
            {sidebarFooter ? <div className="p-2">{sidebarFooter}</div> : null}
          </div>
        </>
      ) : null}

      <button type="button" className="support-fab" aria-label="Открыть поддержку" onClick={() => go('/support')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17.5 4.5 20V7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 17H7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </button>
      <a href="https://t.me/FLUVIONN" target="_blank" rel="noopener noreferrer" className="nav-icon" style={{ position: 'fixed', right: 16, bottom: 'calc(86px + env(safe-area-inset-bottom))', zIndex: 35, background: 'rgba(255,255,255,0.78)' }} aria-label="Telegram">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9.4 15.6 9.2 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.2-1-.4-1.4-1.1-1.1L3.3 10.3c-1 .4-1 1-.2 1.2l4.6 1.4 10.7-6.7c.5-.3 1-.1.6.2" />
        </svg>
      </a>
    </div>
  );
}

export function CargoLink({ to, className, children }) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
