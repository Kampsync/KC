// /calendar.js
import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import dayGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/daygrid';

const calendarEl = document.getElementById('calendar');
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

// sample fetch — swap with live Xano endpoint
async function loadEvents() {
  const res = await fetch(`https://xano.com/api/user-calendar?userId=${userId}`);
  const data = await res.json();
  return data.map(event => ({
    ...event,
    extendedProps: {
      ...event,
      mapsURL: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || '')}`
    }
  }));
}

function buildCalendar(events) {
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    dayCellDidMount: function(info) {
      const today = new Date().toISOString().split('T')[0];
      if (info.date.toISOString().split('T')[0] === today) {
        info.el.style.backgroundColor = '#333';
        info.el.style.border = '2px solid gold';
        info.el.style.borderRadius = '50%';
      }
    },
    events: events,
    eventClick: function(info) {
      const props = info.event.extendedProps;
      alert(`
${info.event.title}
Platform: ${props.platform}
Notes: ${props.notes || '—'}
Address: ${props.address || '—'}

📍 Map: ${props.mapsURL}
      `);
    }
  });

  calendar.render();
}

(async () => {
  const events = await loadEvents();
  buildCalendar(events);
})();

