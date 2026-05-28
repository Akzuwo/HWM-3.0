const TRANSPORT_API_BASE_URL = 'https://transport.opendata.ch/v1';
const RUOPIGEN_STATION_NAME = 'Luzern, Ruopigen Zentrum';
const RUOPIGEN_DEPARTURES_LIMIT = 10;

function parseTransportDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function categoryLabel(category) {
  const normalized = String(category || '').trim().toUpperCase();
  const labels = {
    B: 'Bus',
    BUS: 'Bus',
    NFB: 'Bus',
    T: 'Tram',
    TRAM: 'Tram',
    S: 'S-Bahn',
    IC: 'IC',
    IR: 'IR',
    RE: 'RE',
    R: 'R'
  };

  return labels[normalized] || String(category || '').trim() || 'Linie';
}

function buildLineLabel(entry) {
  const lineNumber = String(entry?.number || '').trim();
  const fallbackName = String(entry?.name || '').trim();
  const label = categoryLabel(entry?.category);

  if (lineNumber) {
    return `${label} ${lineNumber}`.trim();
  }

  return fallbackName || label;
}

function normalizeDeparture(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const stop = entry.stop && typeof entry.stop === 'object' ? entry.stop : {};
  const prognosis = stop.prognosis && typeof stop.prognosis === 'object' ? stop.prognosis : {};
  const plannedDate = parseTransportDate(stop.departure);
  const effectiveDate = parseTransportDate(prognosis.departure);
  const sortDate = effectiveDate || plannedDate;

  if (!sortDate) {
    return null;
  }

  const destination = String(entry.to || '').trim() || 'Unbekannte Richtung';
  const delayMinutes = plannedDate && effectiveDate
    ? Math.round((effectiveDate.getTime() - plannedDate.getTime()) / 60000)
    : null;

  return {
    id: `${buildLineLabel(entry)}-${destination}-${sortDate.getTime()}`,
    line_label: buildLineLabel(entry),
    line_number: String(entry.number || '').trim(),
    category: String(entry.category || '').trim() || null,
    category_label: categoryLabel(entry.category),
    destination,
    planned_departure: plannedDate ? plannedDate.toISOString() : null,
    effective_departure: effectiveDate ? effectiveDate.toISOString() : null,
    delay_minutes: delayMinutes,
    has_realtime: Boolean(effectiveDate),
    platform: String(stop.platform || prognosis.platform || '').trim() || null,
    operator: String(entry.operator || '').trim() || null,
    sort_timestamp: sortDate.getTime()
  };
}

export async function fetchRuopigenDepartures(options = {}) {
  const url = new URL(`${TRANSPORT_API_BASE_URL}/stationboard`);
  url.searchParams.set('station', RUOPIGEN_STATION_NAME);
  url.searchParams.set('limit', String(RUOPIGEN_DEPARTURES_LIMIT));
  url.searchParams.append('transportations[]', 'bus');

  const response = await fetch(url.toString(), {
    method: 'GET',
    signal: options.signal,
    headers: {
      Accept: 'application/json'
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || typeof payload !== 'object') {
    throw new Error('departures_request_failed');
  }

  const station = payload.station && typeof payload.station === 'object' ? payload.station : {};
  const stationboard = Array.isArray(payload.stationboard) ? payload.stationboard : [];
  const departures = stationboard
    .map(normalizeDeparture)
    .filter(Boolean)
    .sort((left, right) => {
      return (left.sort_timestamp || 0) - (right.sort_timestamp || 0)
        || String(left.line_label || '').localeCompare(String(right.line_label || ''))
        || String(left.destination || '').localeCompare(String(right.destination || ''));
    });

  return {
    status: 'ok',
    station: {
      id: station.id || null,
      name: station.name || RUOPIGEN_STATION_NAME
    },
    departures,
    source: 'transport.opendata.ch',
    refreshed_at: new Date().toISOString(),
    meta: {
      station_name: RUOPIGEN_STATION_NAME,
      limit: RUOPIGEN_DEPARTURES_LIMIT,
      has_missing_realtime: departures.some((item) => !item.has_realtime)
    }
  };
}
