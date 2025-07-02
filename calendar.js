<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kampsync Calendar</title>
  <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/index.global.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.css" rel="stylesheet" />
  <style>
    body {
      background: #1c1c1e;
      color: white;
      font-family: 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
    }
    #calendar {
      max-width: 1000px;
      margin: 40px auto;
      padding: 10px;
      background: #2c2c2e;
      border-radius: 8px;
    }
    .fc .fc-daygrid-day-number {
      color: white;
    }
    .fc .fc-day-today {
      background: rgba(255, 215, 0, 0.2);
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div id="calendar"></div>

  <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/index.global.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/index.global.min.js"></script>
  <script>
    const calendarEl = document.getElementById('calendar');
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user_id');

    async function loadEvents() {
      const res = await fetch(`https://xfxa-cldj-sxth.n7e.xano.io/api:PYL3lpvT/fetch_booking_events?user_id=${userId}`);
      const data = await res.json();
      return data.map(item => ({
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
    }

    async function initCalendar() {
      const events = await loadEvents();
      const calendar = new FullCalendar.Calendar(calendarEl, {
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
          alert(`\n${info.event.title}\nPlatform: ${p.platform}\nNotes: ${p.notes || '-'}\nAddress: ${p.address || '-'}\nLink: ${p.bookingLink || '-'}`);
        }
      });
      calendar.render();
    }

    initCalendar();
  </script>
</body>
</html>
