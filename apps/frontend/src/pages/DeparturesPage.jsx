import { useEffect, useRef, useState } from 'react';
import { GlassSkeleton } from '../components/GlassSkeleton';
import { usePageSetup } from '../hooks/usePageSetup';
import { fetchRuopigenDepartures } from '../services/departures';

const AUTO_REFRESH_MS = 20_000;
const MAX_DEPARTURES = 10;
const DESKTOP_BREAKPOINT = 760;

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatClock(value) {
  const date = parseDate(value);
  if (!date) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('de-CH', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function diffMinutes(fromValue, toValue) {
  const fromDate = parseDate(fromValue);
  const toDate = parseDate(toValue);
  if (!fromDate || !toDate) {
    return null;
  }

  return Math.round((toDate.getTime() - fromDate.getTime()) / 60000);
}

function getStatusMeta(departure) {
  const effectiveTime = departure.effective_departure || departure.planned_departure;
  const minutesUntilDeparture = diffMinutes(new Date().toISOString(), effectiveTime);

  if (minutesUntilDeparture !== null && minutesUntilDeparture < 0) {
    return { label: 'abgefahren', tone: 'muted' };
  }

  if (minutesUntilDeparture !== null && minutesUntilDeparture <= 1) {
    return { label: 'fährt bald', tone: 'soon' };
  }

  if (!departure.has_realtime) {
    return { label: 'keine Echtzeitdaten', tone: 'neutral' };
  }

  if ((departure.delay_minutes ?? 0) <= 0) {
    return { label: 'pünktlich', tone: 'success' };
  }

  return { label: `+${departure.delay_minutes} min`, tone: 'delay' };
}

export function DeparturesPage() {
  usePageSetup({ bodyClass: 'departures-page' });

  const [departures, setDepartures] = useState([]);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(MAX_DEPARTURES);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth <= DESKTOP_BREAKPOINT;
    return false;
  });

  const inFlightRef = useRef(false);
  const abortRef = useRef(null);
  const departuresRef = useRef([]);
  const pageRef = useRef(null);
  const panelRef = useRef(null);
  const listShellRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    departuresRef.current = departures;
  }, [departures]);

  async function loadDepartures({ background = false } = {}) {
    if (inFlightRef.current) {
      return;
    }

    const hasExistingData = departuresRef.current.length > 0;
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;
    setMessage('');
    setStatus(background && hasExistingData ? 'refreshing' : 'loading');

    try {
      const payload = await fetchRuopigenDepartures({ signal: controller.signal });
      const nextDepartures = Array.isArray(payload.departures) ? payload.departures.slice(0, MAX_DEPARTURES) : [];

      setDepartures(nextDepartures);
      setStatus(nextDepartures.length ? 'ready' : 'empty');
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      if (hasExistingData) {
        setMessage('Aktualisierung fehlgeschlagen. Letzte geladene Daten werden weiter angezeigt.');
        setStatus('ready');
      } else {
        setMessage('Die Abfahrtsdaten konnten gerade nicht geladen werden.');
        setStatus('error');
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      inFlightRef.current = false;
    }
  }

  useEffect(() => {
    loadDepartures();

    const intervalId = window.setInterval(() => {
      loadDepartures({ background: true });
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT}px)`);
    const update = (e) => setIsMobile(e.matches);
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    } else {
      media.addListener(update);
      return () => media.removeListener(update);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const pageElement = pageRef.current;
    const panelElement = panelRef.current;
    const listShellElement = listShellRef.current;
    const listElement = listRef.current;
    if (!pageElement || !panelElement || !listShellElement || !listElement) {
      return undefined;
    }

    let frameId = 0;
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleMeasure) : null;

    function measureLayout() {
      frameId = 0;

      const footerElement = document.querySelector('.hm-footer');
      if (window.innerWidth > DESKTOP_BREAKPOINT && footerElement) {
        const panelRect = panelElement.getBoundingClientRect();
        const footerRect = footerElement.getBoundingClientRect();
        const footerStyles = window.getComputedStyle(footerElement);
        const footerMarginTop = parseFloat(footerStyles.marginTop) || 0;
        const footerMarginBottom = parseFloat(footerStyles.marginBottom) || 0;
        const availableHeight = Math.floor(window.innerHeight - panelRect.top - footerRect.height - footerMarginTop - footerMarginBottom);
        pageElement.style.setProperty('--departures-panel-max-height', `${Math.max(0, availableHeight)}px`);
      } else {
        pageElement.style.removeProperty('--departures-panel-max-height');
      }

      if (!departuresRef.current.length || window.innerWidth <= DESKTOP_BREAKPOINT) {
        setVisibleLimit(MAX_DEPARTURES);
        return;
      }

      const firstRow = listElement.querySelector('.departure-row');
      if (!firstRow) {
        setVisibleLimit(MAX_DEPARTURES);
        return;
      }

      const headerElement = listElement.querySelector('.departures-list__header');
      const headerVisible = headerElement && window.getComputedStyle(headerElement).display !== 'none';
      const headerHeight = headerVisible ? headerElement.getBoundingClientRect().height : 0;
      const listStyles = window.getComputedStyle(listElement);
      const gap = parseFloat(listStyles.rowGap || listStyles.gap || '0') || 0;
      const rowHeight = firstRow.getBoundingClientRect().height;
      const availableListHeight = Math.max(0, listShellElement.clientHeight - headerHeight);
      const nextVisibleLimit = Math.max(
        1,
        Math.min(MAX_DEPARTURES, Math.floor((availableListHeight + gap) / (rowHeight + gap)))
      );

      setVisibleLimit((currentLimit) => (currentLimit === nextVisibleLimit ? currentLimit : nextVisibleLimit));
    }

    function scheduleMeasure() {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(measureLayout);
    }

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure);

    [panelElement, listShellElement, listElement, document.querySelector('.hm-navbar'), document.querySelector('.hm-footer')]
      .filter(Boolean)
      .forEach((element) => resizeObserver?.observe(element));

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [departures, status]);

  const visibleDepartures = departures.slice(0, visibleLimit);
  const isBusy = status === 'loading' || status === 'refreshing';

  return (
    <>
      <main className="departures-page" id="main" ref={pageRef}>
        <section className="departures-liveboard-panel" aria-live="polite" ref={panelRef}>
          <h1 className="departures-liveboard-panel__title">öV Liveboard</h1>

          {message || status === 'loading' || status === 'empty' ? (
            <div className="departures-feedback">
              {message ? <p className={status === 'error' ? 'departures-error' : 'departures-note'}>{message}</p> : null}
              {status === 'loading' ? <GlassSkeleton label="Abfahrtsdaten werden geladen" rows={5} compact /> : null}
              {status === 'empty' ? <p className="departures-empty">Für diese Haltestelle wurden keine Abfahrten gefunden.</p> : null}
            </div>
          ) : null}

          {visibleDepartures.length > 0 ? (
            <div className="departures-list-shell" ref={listShellRef}>
              <div className="departures-list" role="list" ref={listRef}>
                {!isMobile && (
                  <div className="departures-list__header" aria-hidden="true">
                    <span>Linie</span>
                    <span>Richtung</span>
                    <span>Plan</span>
                    <span>Effektiv</span>
                    <span>Verspätung</span>
                    <span>Status</span>
                  </div>
                )}

                {visibleDepartures.map((departure) => {
                  const statusMeta = getStatusMeta(departure);
                  const effectiveDeparture = departure.effective_departure ? formatClock(departure.effective_departure) : '--:--';
                  const delayLabel = departure.delay_minutes === null
                    ? 'keine Echtzeitdaten'
                    : departure.delay_minutes > 0
                      ? `+${departure.delay_minutes} min`
                      : '0 min';

                  if (isMobile) {
                    return (
                      <article 
                        key={departure.id}
                        role="listitem"
                        className="flex flex-col p-3 mb-3 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-hm-soft relative group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(240, 247, 255, 0.45))',
                          boxShadow: '0 8px 24px rgba(111, 142, 208, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                          border: '1px solid rgba(186, 208, 240, 0.6)',
                        }}
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs px-2 py-0.5 rounded shadow-sm">
                                {departure.line_label || 'Linie'}
                              </span>
                              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                {departure.operator || departure.category_label || 'ÖV'}
                              </span>
                            </div>
                            <h3 className="text-slate-800 font-bold text-base leading-tight">
                              {departure.destination || 'Unbekannte Richtung'}
                            </h3>
                            <div className="text-slate-500 text-xs mt-0.5 font-medium">
                              {departure.platform ? `Steig ${departure.platform}` : 'Ohne Steigangabe'}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end pl-2">
                             <span className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-sm border border-black/5 ${
                               statusMeta.tone === 'success' ? 'bg-emerald-100 text-emerald-700' :
                               statusMeta.tone === 'delay' ? 'bg-rose-100 text-rose-700' :
                               statusMeta.tone === 'soon' ? 'bg-amber-100 text-amber-700' :
                               'bg-slate-100 text-slate-600'
                             }`}>
                               {statusMeta.label}
                             </span>
                          </div>
                        </div>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent my-2"></div>

                        <div className="flex items-center justify-between mt-1">
                           <div className="flex items-center gap-3">
                             <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Geplant</span>
                               <span className="text-slate-600 font-semibold text-sm">{formatClock(departure.planned_departure)}</span>
                             </div>
                             <div className="w-4 h-4 text-blue-300 flex items-center justify-center">
                               <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                               </svg>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Effektiv</span>
                               <span className={`font-bold text-sm ${departure.delay_minutes > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                 {effectiveDeparture}
                               </span>
                             </div>
                           </div>
                           
                           <div className="flex flex-col items-end text-right">
                             <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Verspätung</span>
                             <span className={`text-xs font-bold ${departure.delay_minutes > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                               {delayLabel}
                             </span>
                           </div>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article className="departure-row" key={departure.id} role="listitem">
                      <div className="departure-line">
                        <span className="departure-line__label">{departure.line_label || 'Linie'}</span>
                        <span className="departure-line__meta">{departure.operator || departure.category_label || 'ÖV'}</span>
                      </div>

                      <div className="departure-destination">
                        <span className="departure-destination__name">{departure.destination || 'Unbekannte Richtung'}</span>
                        <span className="departure-destination__meta">
                          {departure.platform ? `Steig ${departure.platform}` : 'Ohne Steigangabe'}
                        </span>
                      </div>

                      <div className="departure-time">
                        <span className="departure-time__value">{formatClock(departure.planned_departure)}</span>
                        <span className="departure-time__label">geplant</span>
                      </div>

                      <div className="departure-time">
                        <span className="departure-time__value">{effectiveDeparture}</span>
                        <span className="departure-time__label">effektiv</span>
                      </div>

                      <div className="departure-delay">
                        <span className="departure-delay__value">{delayLabel}</span>
                        <span className="departure-delay__label">Verspätung</span>
                      </div>

                      <span className={`departure-status departure-status--${statusMeta.tone}`}>{statusMeta.label}</span>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="departures-actions">
            <button
              type="button"
              className="departures-refresh departures-refresh--primary"
              onClick={() => loadDepartures({ background: departures.length > 0 })}
              disabled={isBusy}
            >
              Jetzt aktualisieren
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
