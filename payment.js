/* Razorpay checkout. The backend creates orders and verifies signatures. */
const pending = (() => { try { return JSON.parse(localStorage.getItem("pendingBooking")); } catch (e) { return null; } })();
const byId = id => document.getElementById(id);
const payButton = byId("payNow");
const message = byId("paymentMessage");
const API_BASE = String(window.TICKETBOOKER_API_BASE || "").replace(/\/$/, "");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("is-error", isError);
  message.classList.toggle("is-success", !isError);
}

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
  byId("backToSeats").href = "booking.html?id=" + encodeURIComponent(pending.movieId);
}

async function startRazorpayPayment() {
  if (!pending) return;
  if (!API_BASE || API_BASE.includes("YOUR-RENDER-SERVICE")) {
    showMessage("Payment backend is not connected yet. Deploy the backend and set its URL in payment.html.", true);
    return;
  }
  if (!window.Razorpay) {
    showMessage("Razorpay Checkout could not load. Check your internet connection and try again.", true);
    return;
  }

  payButton.disabled = true;
  payButton.textContent = "Creating secure order…";
  showMessage("");

  try {
    const orderResponse = await fetch(API_BASE + "/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: pending.movieId, seats: pending.seats })
    });
    const orderData = await orderResponse.json();
    if (!orderResponse.ok) throw new Error(orderData.error || "Could not create payment order.");

    const checkout = new Razorpay({
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "TicketBooker",
      description: pending.movieTitle + " movie tickets",
      order_id: orderData.orderId,
      prefill: { name: pending.name, contact: pending.phone },
      notes: { booking_id: pending.id },
      theme: { color: "#f04462" },
      handler: async function (response) {
        payButton.disabled = true;
        payButton.textContent = "Verifying payment…";
        showMessage("Payment received by checkout. Verifying securely…");
        try {
          const verifyResponse = await fetch(API_BASE + "/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok || !verifyData.verified) throw new Error(verifyData.error || "Payment verification failed.");
          const booking = { ...pending, paymentStatus: "Paid", paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id };
          const bookings = getBookings();
          const existingIndex = bookings.findIndex(item => item.id === booking.id);
          if (existingIndex >= 0) bookings[existingIndex] = booking;
          else bookings.push(booking);
          saveBookings(bookings);
          localStorage.removeItem("pendingBooking");
          window.location.href = "confirm.html?id=" + encodeURIComponent(booking.id);
        } catch (error) {
          showMessage(error.message || "Could not verify payment. Please contact support before retrying.", true);
          payButton.disabled = false;
          payButton.textContent = "Retry secure payment";
        }
      },
      modal: { ondismiss: function () {
        payButton.disabled = false;
        payButton.textContent = "Pay securely";
        showMessage("Checkout closed. Your booking is still pending.", true);
      } }
    });
    checkout.on("payment.failed", function (response) {
      showMessage(response.error?.description || "Payment failed. Please try again.", true);
      payButton.disabled = false;
      payButton.textContent = "Retry secure payment";
    });
    checkout.open();
  } catch (error) {
    showMessage(error.message || "Unable to connect to payment server.", true);
    payButton.disabled = false;
    payButton.textContent = "Pay securely";
  }
}
payButton.addEventListener("click", startRazorpayPayment);