import { Calendar } from 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/index.global.min.js';
import dayGridPlugin from 'https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.js';

const calendarEl = document.getElementById('calendar');
const userId = new URLSearchParams(window.location.search).get('user_id');
let allEvents = [], calendar;
const listingColors = {}; // local color overrides

async function loadEvents() {
  const res = await fetch(`https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/fetch_booking_events?user_id=${userId}`);
  const data = await res.json();
  allEvents = data.map(item => ({
    title: `${item.platform} - ${item.customer_name || ''}`,
    start: item.start_date,
    end: item.end_date,
    color: listingColors[item.listing_id] || item.color || '#FFD700',
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
  populateListingOptions();
  renderCalendar(allEvents);
}

function populateColorControls() {
  const container = document.getElementById('colorControls');
  const listings = [...new Set(allEvents.map(e => e.extendedProps.listingId))];
  const colors = [["#FFD700","Gold"],["#1E90FF","Blue"],["#FF4500","Red"],["#32CD32","Green"],["#808080","Gray"],
    ["#8A2BE2","Purple"],["#FF69B4","Pink"],["#00CED1","DarkTurquoise"],["#FF8C00","DarkOrange"],
    ["#ADFF2F","GreenYellow"],["#9932CC","DarkOrchid"],["#FF1493","DeepPink"],["#20B2AA","LightSeaGreen"],
    ["#7FFF00","Chartreuse"],["#DC143C","Crimson"],["#00FA9A","MediumSpringGreen"],["#FF6347","Tomato"],
    ["#BA55D3","MediumOrchid"],["#3CB371","MediumSeaGreen"],["#FFDAB9","PeachPuff"],["#CD5C5C","IndianRed"],
    ["#66CDAA","MediumAquamarine"],["#F08080","LightCoral"],["#B22222","FireBrick"],["#DA70D6","Orchid"]];
  container.innerHTML = '';
  listings.forEach(id => {
    let options = colors.map(([hex,name]) => `<option value="${hex}">${name}</option>`).join('');
    container.innerHTML += `<label>Listing ${id}: 
      <select onchange="setListingColor(${id}, this.value)">${options}</select>
    </label>`;
  });
}

function setListingColor(listingId, color) {
  listingColors[listingId] = color;
  renderCalendar(allEvents);
}

function populateListingOptions() {
  const listings = [...new Set(allEvents.map(e => e.extendedProps.listingId))];
  document.getElementById('customListings').innerHTML = listings.map(id => `<option value="${id}">${id}</option>`).join('');
}

function renderCalendar(events) {
  if (calendar) calendar.destroy();
  calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    dayCellDidMount: function(info) {
      const today = new Date().toISOString().split('T')[0];
      if (info.date.toISOString().split('T')[0] === today) {
        info.el.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
        info.el.style.borderRadius = '50%';
      }
    },
    events: events.map(e => ({
      ...e,
      color: listingColors[e.extendedProps.listingId] || e.color
    })),
    eventClick: function(info) {
      const p = info.event.extendedProps;
      let mapUrl = p.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}` : '-';
      alert(`Booking: ${info.event.title}
Platform: ${p.platform}
Notes: ${p.notes || '-'}
Address: ${p.address || '-'}
Map Link: ${mapUrl}
Booking Link: ${p.bookingLink || '-'}`);
    },
    dateClick: function(info) {
      document.getElementById('customStart').value = info.dateStr;
      document.getElementById('customEnd').value = info.dateStr;
      document.getElementById('customNotes').value = '';
      document.getElementById('customModal').style.display = 'block';
    }
  });
  calendar.render();
}

function closeCustomModal() {
  document.getElementById('customModal').style.display = 'none';
}

async function saveCustomEvent() {
  const start = document.getElementById('customStart').value;
  const end = document.getElementById('customEnd').value;
  const notes = document.getElementById('customNotes').value;
  const listings = [...document.getElementById('customListings').selectedOptions].map(o => o.value);
  for (const listingId of listings) {
    await fetch('https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/create_custom_event', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: userId,
        listing_id: listingId,
        start_date: start,
        end_date: end,
        notes: notes
      })
    });
  }
  alert('Custom block saved. Will appear on next load.');
  closeCustomModal();
  loadEvents();
}

window.setListingColor = setListingColor;
window.closeCustomModal = closeCustomModal;
window.saveCustomEvent = saveCustomEvent;

loadEvents();
