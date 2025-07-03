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
  <label>Listing Colors:</label>
  <span id="colorControls"></span>
</div>
<div id="calendar"></div>
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
      bookingId: item.id,
      platform: item.platform,
      address: item.delivery_address,
      bookingLink: item.booking_link,
      notes: item.notes,
      listingId: item.listing_id,
      type: item.type
    }
  }));
  populateColorControls();
  renderCalendar(allEvents);
}

function populateColorControls() {
  const container = document.getElementById('colorControls');
  const listings = [...new Set(allEvents.map(e => e.extendedProps.listingId))];
  const colors = [
    ["#FFD700","Gold"], ["#1E90FF","Blue"], ["#FF4500","Red"], ["#32CD32","Green"], ["#808080","Gray"],
    ["#8A2BE2","Purple"], ["#FF69B4","Pink"], ["#00CED1","DarkTurquoise"], ["#FF8C00","DarkOrange"],
    ["#ADFF2F","GreenYellow"], ["#9932CC","DarkOrchid"], ["#FF1493","DeepPink"], ["#20B2AA","LightSeaGreen"],
    ["#7FFF00","Chartreuse"], ["#DC143C","Crimson"], ["#00FA9A","MediumSpringGreen"], ["#FF6347","Tomato"],
    ["#BA55D3","MediumOrchid"], ["#3CB371","MediumSeaGreen"], ["#FFDAB9","PeachPuff"],
    ["#CD5C5C","IndianRed"], ["#66CDAA","MediumAquamarine"], ["#F08080","LightCoral"], ["#B22222","FireBrick"],
    ["#DA70D6","Orchid"]
  ];
  container.innerHTML = '';
  listings.forEach(id => {
    let options = colors.map(([hex,name]) => `<option value="${hex}">${name}</option>`).join('');
    container.innerHTML += `<label>Listing ${id}: 
      <select onchange="updateListingColor(${id}, this.value)">${options}</select>
    </label>`;
  });
}

async function updateListingColor(listingId, color) {
  await fetch('https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/update_listing_color', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user_id: userId, listing_id: listingId, color: color })
  });
  alert('Color saved. Will appear on next load.');
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
      const newAddr = prompt(`Address for ${info.event.title}:`, p.address || '');
      if (newAddr !== null) updateBookingAddress(p.bookingId, newAddr);
    }
  });
  calendar.render();
}

async function updateBookingAddress(bookingId, newAddress) {
  await fetch('https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/update_booking_address', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user_id: userId, booking_id: bookingId, address: newAddress })
  });
  alert('Address saved. Will appear on next load.');
}

loadEvents();
</script>
</body>
</html>
