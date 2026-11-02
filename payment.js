const pending = (() => { try { return JSON.parse(localStorage.getItem("pendingBooking")); } catch(e) { return null; } })();
const byId = id => document.getElementById(id);
if (!pending) {
  byId("checkoutError").classList.remove("hidden");
} else {
  byId("checkoutContent").classList.remove("hidden");
  byId("movieTitle").textContent = pending.movieTitle || "Movie ticket";
  byId("showDate").textContent = prettyDate(pending.date);
  byId("showTime").textContent = pending.time;
  byId("showSeats").textContent = (pending.seats || []).join(", ");
  byId("bookingId").textContent = pending.id;
  byId("customerName").textContent = pending.name;
  byId("totalAmount").textContent = "₹" + pending.total;
  byId("paymentTotal").textContent = "₹" + pending.total;
  byId("backToSeats").href = "booking.html?id=" + pending.movieId;
}
byId("finishDemo").addEventListener("click", function() {
  if (!pending) return;
  const bookings = getBookings();
  if (!bookings.some(b => b.id === pending.id)) {
    pending.paymentStatus = "Not verified (demo)";
    bookings.push(pending);
    saveBookings(bookings);
  }
  localStorage.removeItem("pendingBooking");
  window.location.href = "confirm.html?id=" + encodeURIComponent(pending.id);
});
