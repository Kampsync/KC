<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kampsync Calendar</title>
  <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/index.global.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.css" rel="stylesheet" />
  <style>
    body { background: #1c1c1e; color: white; font-family: 'Helvetica Neue', sans-serif; margin: 0; padding: 0; }
    #controls { padding: 10px; text-align: center; }
    #calendar { max-width: 1000px; margin: 20px auto; padding: 10px; background: #2c2c2e; border-radius: 8px; }
    .fc .fc-daygrid-day-number { color: white; }
    .fc .fc-day-today { background: rgba(255, 215, 0, 0.2); border-radius: 50%; }
    input, select, button { margin: 5px; padding: 5px; }
  </style>
</head>
<body>
<div id="controls">
  <label>Filter by Listing:<select id="listingFilter" multiple></select></label>
  <label>Filter by Platform:<select id="platformFilter" multiple></select></label>
  <button onclick="showBlockDateForm()">+ Block Dates</button>
</div>
<div id="calendar"></div>
<div id="blockDateModal" style="display:none;position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#333;padding:20px;border-radius:8px;">
  <h3>Block Dates</h3>
  <label>Start: <input type="date" id="blockStart"></label><br>
  <label>End: <input type="date" id="blockEnd"></label><br>
  <label>Notes: <input type="text" id="blockNotes"></label><br>
  <label>Apply to Listings:<select id="blockListings" multiple></select></label><br>
  <button onclick="saveBlockDates()">Save</button>
  <button onclick="closeBlockDateForm()">Cancel</button>
</div>
<script src="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/index.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.js"></script>
<script>
const calendarEl = document.getElementById('calendar');
const userId = new URLSearchParams(window.location.search).get('user_id');
let allEvents = [], calendar;

async function loadEvents() {
  const res = await fetch(`https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/fetch_booking_events?user_id=${userId}`);
  const data = await res.json();
  allEvents = data.map(item => ({
    title: `${item.platform} - ${item.customer_name}`,
    start: item.start_date,
    end: item.end_date,
    color: item.color,
    extendedProps: {
      platform: item.platform,
      address: item.delivery_address,
      bookingLink: item.booking_link,
      notes: item.notes,
      listingId: item.listing_id,
      type: item.type
    }
  }));
  populateFilters();
  renderCalendar(allEvents);
}

function populateFilters() {
  const listings = [...new Set(allEvents.map(e => e.extendedProps.listingId))];
  const platforms = [...new Set(allEvents.map(e => e.extendedProps.platform))];
  const listingSelect = document.getElementById('listingFilter');
  const platformSelect = document.getElementById('platformFilter');
  listings.forEach(id => listingSelect.innerHTML += `<option value="${id}">${id}</option>`);
  platforms.forEach(p => platformSelect.innerHTML += `<option value="${p}">${p}</option>`);
  document.getElementById('blockListings').innerHTML = listings.map(id => `<option value="${id}">${id}</option>`).join('');
  listingSelect.onchange = platformSelect.onchange = () => applyFilters();
}

function applyFilters() {
  const selectedListings = [...document.getElementById('listingFilter').selectedOptions].map(o => o.value);
  const selectedPlatforms = [...document.getElementById('platformFilter').selectedOptions].map(o => o.value);
  const filtered = allEvents.filter(e =>
    (selectedListings.length === 0 || selectedListings.includes(e.extendedProps.listingId.toString())) &&
    (selectedPlatforms.length === 0 || selectedPlatforms.includes(e.extendedProps.platform))
  );
  calendar.removeAllEvents();
  calendar.addEventSource(filtered);
}

function renderCalendar(events) {
  calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    dayCellDidMount: function(info) {
      const today = new Date().toISOString().split('T')[0];
      if (info.date.toISOString().split('T')[0] === today) {
        info.el.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
        info.el.style.borderRadius = '50%';
      }
    },
    events: events,
    eventClick: function(info) {
      const p = info.event.extendedProps;
      const mapLink = p.address ? `\nMap: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}` : '';
      alert(`\n${info.event.title}\nPlatform: ${p.platform}\nNotes: ${p.notes || '-'}\nAddress: ${p.address || '-'}${mapLink}\nLink: ${p.bookingLink || '-'}`);
    }
  });
  calendar.render();
}

function showBlockDateForm() { document.getElementById('blockDateModal').style.display = 'block'; }
function closeBlockDateForm() { document.getElementById('blockDateModal').style.display = 'none'; }

async function saveBlockDates() {
  const start = document.getElementById('blockStart').value;
  const end = document.getElementById('blockEnd').value;
  const notes = document.getElementById('blockNotes').value;
  const listings = [...document.getElementById('blockListings').selectedOptions].map(o => o.value);
  for (const listingId of listings) {
    await fetch('https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/create_block_event', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: userId,
        listing_id: listingId,
        start_date: start,
        end_date: end,
        notes: notes,
        type: 'custom'
      })
    });
  }
  closeBlockDateForm();
  loadEvents();
}

loadEvents();
</script>
</body>
</html>
