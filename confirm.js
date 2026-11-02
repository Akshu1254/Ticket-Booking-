/* =========================================================
   confirm.js -> Ticket page ka logic
   URL: confirm.html?id=TBXXXXXX
   localStorage se booking nikalke ticket dikhata hai
   ========================================================= */

const params = new URLSearchParams(window.location.search);
const bookingId = params.get("id");

const booking = getBookings().find(function (b) {
  return b.id === bookingId;
});

const ticketWrap = document.getElementById("ticketWrap");

if (!booking) {
  document.getElementById("successBox").innerHTML =
    "<h1>Ticket not found. 😕</h1><p>The booking may have been cancelled or the link may be incorrect.</p>";
  document.getElementById("printBtn").classList.add("hidden");
} else {
  const movie = movies.find(function (m) { return m.id === booking.movieId; });
  const gradient = movie ? movie.gradient : "#333";
  const emoji = movie ? movie.emoji : "🎬";

  ticketWrap.innerHTML =
    '<div class="ticket">' +
    '<div class="ticket-top">' +
    '<div class="poster-small" style="background:' + gradient + '">' + emoji + "</div>" +
    "<div><h2>" + escapeHTML(booking.movieTitle) + "</h2>" +
    '<p class="meta">' + (movie ? movie.genre + " • " + movie.language : "") + "</p></div>" +
    "</div>" +
    '<div class="ticket-cut"></div>' +
    '<div class="ticket-bottom">' +
    "<div><small>Date</small><b>" + prettyDate(booking.date) + "</b></div>" +
    "<div><small>Time</small><b>" + booking.time + "</b></div>" +
    "<div><small>Seats</small><b>" + booking.seats.join(", ") + "</b></div>" +
    "<div><small>Total Paid</small><b>₹" + booking.total + "</b></div>" +
    "<div><small>Name</small><b>" + escapeHTML(booking.name) + "</b></div>" +
    '<div><small>Payment Status</small><b>Not verified (demo)</b></div>' +
    "<div><small>Phone</small><b>" + escapeHTML(booking.phone) + "</b></div>" +
    '<div class="booking-id">' + booking.id + "</div>" +
    "</div></div>";
}

document.getElementById("printBtn").addEventListener("click", function () {
  window.print();
});
