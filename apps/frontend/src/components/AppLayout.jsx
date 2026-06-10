import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsentBanner } from './CookieConsentBanner';

const LAYOUTS = {
  '/': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/index.html': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/mehr-ueber-hwm': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/about': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/about.html': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/mehr-ueber-hwm.html': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/geschichte': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/geschichte.html': { mainClassName: 'hm-react-main--landing', shellClassName: 'hm-react-shell--landing' },
  '/login': { shellClassName: 'login-shell', footer: false },
  '/login.html': { shellClassName: 'login-shell', footer: false },
  '/kalender': { footer: false },
  '/kalender.html': { footer: false },
  '/abfahrten': { mainClassName: 'hm-react-main--departures' },
  '/abfahrten/': { mainClassName: 'hm-react-main--departures' },
  '/notenrechner': { mainClassName: 'hm-react-main--grade-calculator', shellClassName: 'hm-react-shell--grade-calculator' },
  '/notenrechner.html': { mainClassName: 'hm-react-main--grade-calculator', shellClassName: 'hm-react-shell--grade-calculator' }
};

const DEFAULT_LAYOUT = Object.freeze({ mainClassName: '', shellClassName: '', footer: true });

function getLayout(pathname) {
  return { ...DEFAULT_LAYOUT, ...(LAYOUTS[pathname.toLowerCase()] || {}) };
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { footer, mainClassName, shellClassName } = getLayout(location.pathname);
  const transition = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
      }
    : {
        initial: { opacity: 0, y: 12, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.99 },
        transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
      };

  useEffect(() => {
    window.hmNavigate = navigate;
    return () => {
      delete window.hmNavigate;
    };
  }, [navigate]);

  return (
    <div className={`hm-react-shell ${shellClassName}`.trim()}>
      <div className="hm-app-backdrop" aria-hidden="true">
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--violet"></div>
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--cyan"></div>
        <div className="hm-app-backdrop__grid"></div>
      </div>
      <Header />
      <div id="pageContent">
        <div className={`hm-react-main ${mainClassName}`.trim()}>
          <div className="hm-react-main__inner">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div className="hm-route-transition" key={location.pathname} {...transition}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {footer ? <Footer /> : null}
      </div>
      <CookieConsentBanner />
    </div>
  );
}
