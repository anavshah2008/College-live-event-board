const SHEET_NAME = 'Events';

/**
 * Get the Events sheet.
 */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);

  if (!sh) {
    throw new Error('Sheet "' + SHEET_NAME + '" was not found.');
  }

  return sh;
}


/**
 * Main web-app entry point.
 */
function doGet(e) {
  return HtmlService
    .createHtmlOutput(boardHtml_())
    .setTitle('College Live Event Board')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/**
 * Handle POST requests.
 */
function doPost(e) {
  let body = {};

  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return json_({
      success: false,
      message: 'Invalid JSON request.'
    });
  }

  // Support payload being sent as a JSON string.
  if (body && typeof body.payload === 'string') {
    try {
      body = JSON.parse(body.payload);
    } catch (err2) {
      return json_({
        success: false,
        message: 'Invalid payload JSON.'
      });
    }
  }

  const action = body.action || '';

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (action === 'update_status') {
      return json_(updateStatus_(body));
    }

    if (action === 'create_event') {
      return json_(createEvent_(body));
    }

    if (action === 'list') {
      return json_(listEvents_());
    }

    return json_({
      success: false,
      message: 'Unknown action.'
    });

  } catch (err) {

    return json_({
      success: false,
      message: err.message || String(err)
    });

  } finally {

    try {
      lock.releaseLock();
    } catch (err) {}
  }
}


/**
 * Server-side function used by the webpage
 * to retrieve events.
 */
function getEvents() {
  try {
    return listEvents_();
  } catch (err) {
    return {
      success: false,
      events: [],
      message: err.message || String(err)
    };
  }
}


/**
 * Update an existing event's status/details.
 */
function updateStatus_(b) {

  const sh = sheet_();
  const data = sh.getDataRange().getValues();

  const name = String(b.event_name || '')
    .trim()
    .toLowerCase();

  if (!name) {
    return {
      success: false,
      message: 'Event name is required.'
    };
  }

  for (let i = 1; i < data.length; i++) {

    if (
      String(data[i][0])
        .trim()
        .toLowerCase() === name
    ) {

      const row = i + 1;

      if (b.status) {
        sh.getRange(row, 5).setValue(b.status);
      }

      if (b.new_venue) {
        sh.getRange(row, 2).setValue(b.new_venue);
      }

      if (b.new_date) {
        sh.getRange(row, 3).setValue(b.new_date);
      }

      if (b.new_time) {
        sh.getRange(row, 4).setValue(b.new_time);
      }

      if (b.note !== undefined) {
        sh.getRange(row, 6).setValue(b.note || '');
      }

      sh.getRange(row, 7).setValue(new Date());

      SpreadsheetApp.flush();

      return {
        success: true,
        event_name: data[i][0],
        new_status: b.status,
        visible_to_students: true,
        message:
          'Event status updated and published to the live board.'
      };
    }
  }

  // If event doesn't exist, add it.
  sh.appendRow([
    b.event_name || '',
    b.new_venue || '',
    b.new_date || '',
    b.new_time || '',
    b.status || '',
    b.note || '',
    new Date()
  ]);

  SpreadsheetApp.flush();

  return {
    success: true,
    event_name: b.event_name,
    new_status: b.status,
    visible_to_students: true,
    message:
      'Event was not on the board, so it was added with the new status.'
  };
}


/**
 * Create a new event.
 */
function createEvent_(b) {

  const sh = sheet_();

  if (!b.event_name) {
    return {
      success: false,
      message: 'Event name is required.'
    };
  }

  sh.appendRow([
    b.event_name || '',
    b.venue || '',
    b.date || '',
    b.start_time || '',
    'upcoming',
    '',
    new Date()
  ]);

  SpreadsheetApp.flush();

  return {
    success: true,
    event_name: b.event_name,
    status: 'upcoming',
    visible_to_students: true,
    message:
      'New event created and published to the live board.'
  };
}


/**
 * Read all events from the spreadsheet.
 */
function listEvents_() {

  const sh = sheet_();
  const data = sh.getDataRange().getValues();

  const events = [];

  for (let i = 1; i < data.length; i++) {

    if (!data[i][0]) {
      continue;
    }

    events.push({

      event_name: String(data[i][0]),

      venue: String(data[i][1] || ''),

      scheduled_time:
        (
          String(data[i][2] || '') +
          ' ' +
          String(data[i][3] || '')
        ).trim(),

      status:
        String(data[i][4] || 'upcoming'),

      note:
        String(data[i][5] || '')
    });
  }

  return {
    success: true,
    events: events
  };
}


/**
 * Return JSON response for API requests.
 */
function json_(obj) {

  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}


/**
 * Generate the complete webpage.
 */
function boardHtml_() {

  return `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1">

<title>College Live Event Board</title>

<style>

* {
  box-sizing: border-box;
}

body {
  font-family:
    Arial,
    Helvetica,
    sans-serif;

  background: #0f172a;

  color: #f8fafc;

  margin: 0;

  padding: 24px;
}

.container {
  max-width: 1200px;

  margin: 0 auto;
}

h1 {
  font-size: 26px;

  margin: 0 0 6px;
}

p.up {
  color: #94a3b8;

  font-size: 13px;

  margin: 0 0 24px;
}

.table-wrapper {
  overflow-x: auto;

  background: #111827;

  border-radius: 10px;

  border: 1px solid #334155;
}

table {
  width: 100%;

  border-collapse: collapse;

  min-width: 700px;
}

th,
td {
  padding: 12px 14px;

  text-align: left;

  border-bottom:
    1px solid #334155;

  font-size: 14px;
}

th {
  color: #94a3b8;

  text-transform: uppercase;

  font-size: 11px;

  letter-spacing: 1px;

  background: #0f172a;
}

tr:last-child td {
  border-bottom: none;
}

.badge {
  display: inline-block;

  padding: 4px 10px;

  border-radius: 12px;

  font-size: 11px;

  font-weight: bold;

  color: #fff;

  text-transform: capitalize;
}

.live {
  background: #16a34a;
}

.upcoming {
  background: #2563eb;
}

.delayed {
  background: #d97706;
}

.rescheduled {
  background: #7c3aed;
}

.venue_changed {
  background: #0891b2;
}

.cancelled {
  background: #dc2626;
}

.completed {
  background: #475569;
}

.loading {
  text-align: center;

  color: #94a3b8;

  padding: 30px;
}

.error {
  color: #f87171;

  padding: 20px;

  text-align: center;
}

.empty {
  color: #94a3b8;

  padding: 30px;

  text-align: center;
}

@media (max-width: 600px) {

  body {
    padding: 14px;
  }

  h1 {
    font-size: 21px;
  }

  th,
  td {
    padding: 10px;
    font-size: 13px;
  }

}

</style>

</head>


<body>

<div class="container">

<h1>
  College Live Event Board
</h1>

<p class="up" id="up">
  Loading events...
</p>

<div class="table-wrapper">

<table>

<thead>

<tr>

<th>Event</th>

<th>Venue</th>

<th>Time</th>

<th>Status</th>

<th>Note</th>

</tr>

</thead>

<tbody id="rows">

<tr>

<td colspan="5"
    class="loading">

Loading events...

</td>

</tr>

</tbody>

</table>

</div>

</div>


<script>

/**
 * Safely format text.
 */
function fmt(value) {

  return String(
    value == null ? "" : value
  ).replace(/_/g, " ");

}


/**
 * Escape HTML so spreadsheet
 * values cannot break the page.
 */
function escapeHtml(value) {

  return String(
    value == null ? "" : value
  )
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

}


/**
 * Load events from Apps Script.
 */
function load() {

  google.script.run

    .withSuccessHandler(function(data) {

      const tb =
        document.getElementById("rows");

      const update =
        document.getElementById("up");

      tb.innerHTML = "";

      if (!data || !data.success) {

        tb.innerHTML =
          '<tr><td colspan="5" class="error">' +
          escapeHtml(
            data && data.message
              ? data.message
              : "Unable to load events."
          ) +
          '</td></tr>';

        update.textContent =
          "Unable to load events.";

        return;
      }


      if (!data.events ||
          data.events.length === 0) {

        tb.innerHTML =
          '<tr><td colspan="5" class="empty">' +
          'No events available.' +
          '</td></tr>';

      } else {

        data.events.forEach(function(ev) {

          const tr =
            document.createElement("tr");

          const status =
            String(
              ev.status || "upcoming"
            ).toLowerCase();

          tr.innerHTML =

            "<td><b>" +
            escapeHtml(ev.event_name) +
            "</b></td>" +

            "<td>" +
            escapeHtml(fmt(ev.venue)) +
            "</td>" +

            "<td>" +
            escapeHtml(
              fmt(ev.scheduled_time)
            ) +
            "</td>" +

            "<td>" +

            "<span class='badge " +
            escapeHtml(status) +
            "'>" +

            escapeHtml(
              fmt(status)
            ) +

            "</span>" +

            "</td>" +

            "<td>" +
            escapeHtml(ev.note) +
            "</td>";

          tb.appendChild(tr);

        });

      }


      update.textContent =
        "Auto-refreshing • Last update " +
        new Date().toLocaleTimeString();

    })


    .withFailureHandler(function(error) {

      const tb =
        document.getElementById("rows");

      const update =
        document.getElementById("up");

      tb.innerHTML =

        '<tr><td colspan="5" class="error">' +

        "Error loading events: " +

        escapeHtml(
          error && error.message
            ? error.message
            : String(error)
        ) +

        '</td></tr>';

      update.textContent =
        "Connection error.";

    })


    .getEvents();

}


/**
 * Initial load.
 */
load();


/**
 * Refresh every 10 seconds.
 */
setInterval(
  load,
  10000
);

</script>

</body>

</html>
`;
}
