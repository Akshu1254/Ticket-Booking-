/* Direct UPI intent checkout. A static site cannot verify payment status. */
const pending = (() => { try { return JSON.parse(localStorage.getItem("pendingBooking")); } catch (e) { return null; } })();
const byId = id => document.getElementById(id);
const UPI_ID = "7807925953@superyes";
const money = Number(pending && pending.total);
const message = byId("paymentMessage");

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle("is-error", error);
  message.classList.toggle("is-success", !error);
}

if (!pending || !Number.isFinite(money) || money <= 0) {
  byId("checkoutError").classList.remove("hidden");
} else {
  byId("checkoutContent").classList.remove("hidden");
  byId("movieTitle").textContent = pending.movieTitle || "Movie ticket";
  byId("showDate").textContent = typeof prettyDate === "function" ? prettyDate(pending.date) : pending.date;
  byId("showTime").textContent = pending.time || "—";
  byId("showSeats").textContent = (pending.seats || []).join(", ") || "—";
  byId("bookingId").textContent = pending.id || "—";
  byId("customerName").textContent = pending.name || "—";
  byId("totalAmount").textContent = "₹" + money.toFixed(2);
  byId("paymentTotal").textContent = "₹" + money.toFixed(2);
  byId("backToSeats").href = "booking.html?id=" + encodeURIComponent(pending.movieId);

  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: "TicketBooker",
    am: money.toFixed(2),
    cu: "INR",
    tn: "TicketBooker " + (pending.id || "Movie booking")
  });
  const upiUri = "upi://pay?" + params.toString();
  byId("openUpi").href = upiUri;
  byId("upiQr").src = "https://api.qrserver.com/v1/create-qr-code/?size=360x360&format=png&data=" + encodeURIComponent(upiUri);
  byId("upiQr").addEventListener("error", () => showMessage("QR image service did not load. Use the UPI ID and Open UPI App link instead.", true));
  byId("copyUpi").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      showMessage("UPI ID copied. Verify the recipient in your UPI app before paying.");
    } catch {
      showMessage("Copy unavailable in this browser. Select the UPI ID shown above manually.", true);
    }
  });
  byId("openUpi").addEventListener("click", () => {
    showMessage("Your UPI app should open. Check the displayed payee and amount carefully. Payment is not verified by this website.");
  });
}
