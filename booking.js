/* =========================================================
   booking.js -> Seat selection page ka logic
   Flow: date chuno -> time chuno -> seats chuno -> confirm
   ========================================================= */

// URL se movie id nikalo: booking.html?id=3
const params = new URLSearchParams(window.location.search);
const movie = movies.find(function (m) {
  return m.id === Number(params.get("id"));
});

// Current selection ki state
let selectedDate = null;
let selectedTime = null;
let selectedSeats = [];

const seatGrid = document.getElementById("seatGrid");
const confirmBtn = document.getElementById("confirmBtn");
const errorMsg = document.getElementById("errorMsg");

function pad(n) {
  return String(n).padStart(2, "0");
}

// Aaj se lekar next `count` din ki list
function getNextDays(count) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    days.push({ value: value, label: prettyDate(value) });
  }
  return days;
}

// Movie ki detail upar dikhao
function renderHeader() {
  document.getElementById("movieHeader").innerHTML =
    '<div class="poster-small" style="background:' + movie.gradient + '">' + movie.emoji + "</div>" +
    "<div><h2>" + movie.title + "</h2>" +
    "<p>" + movie.genre + " • " + movie.language + " • " + movie.duration + "</p>" +
    "<p>" + movie.description + "</p>" +
    "<p>Regular ₹" + movie.price + " | Premium (rows G, H) ₹" + (movie.price + PREMIUM_EXTRA) + "</p></div>";
}

// Date buttons
function renderDates() {
  const row = document.getElementById("dateRow");
  row.innerHTML = "";
  getNextDays(5).forEach(function (day) {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = day.label;
    btn.addEventListener("click", function () {
      selectedDate = day.value;
      selectedSeats = [];
      markActive(row, btn);
      renderSeats();
    });
    row.appendChild(btn);
  });
}

// Time buttons
function renderTimes() {
  const row = document.getElementById("timeRow");
  row.innerHTML = "";
  movie.timings.forEach(function (t) {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = t;
    btn.addEventListener("click", function () {
      selectedTime = t;
      selectedSeats = [];
      markActive(row, btn);
      renderSeats();
    });
    row.appendChild(btn);
  });
}

// Jo button click hua usko "active" class do, baaki se hata do
function markActive(row, activeBtn) {
  row.querySelectorAll(".chip").forEach(function (b) {
    b.classList.remove("active");
  });
  activeBtn.classList.add("active");
}

// Seat grid banao
function renderSeats() {
  seatGrid.innerHTML = "";

  if (!selectedDate || !selectedTime) {
    seatGrid.innerHTML = '<p class="seat-msg">Pehle date aur show time chuno 👆</p>';
    updateSummary();
    return;
  }

  const booked = getBookedSeats(movie.id, selectedDate, selectedTime);

  ROWS.forEach(function (rowLetter) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "seat-row";

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = rowLetter;
    rowDiv.appendChild(label);

    for (let c = 1; c <= COLS; c++) {
      const seatId = rowLetter + c;
      const seat = document.createElement("button");
      seat.className = "seat";
      seat.textContent = c;
      seat.title = seatId + " - ₹" + seatPrice(movie, seatId);

      if (PREMIUM_ROWS.includes(rowLetter)) seat.classList.add("premium");

      if (booked.has(seatId)) {
        seat.classList.add("booked");
        seat.disabled = true;
      } else {
        if (selectedSeats.includes(seatId)) seat.classList.add("selected");
        seat.addEventListener("click", function () {
          toggleSeat(seatId, seat);
        });
      }
      rowDiv.appendChild(seat);

      // Beech mein walkway (aisle)
      if (c === COLS / 2) {
        const aisle = document.createElement("span");
        aisle.className = "aisle";
        rowDiv.appendChild(aisle);
      }
    }
    seatGrid.appendChild(rowDiv);
  });

  updateSummary();
}

// Seat select / deselect
function toggleSeat(seatId, element) {
  const index = selectedSeats.indexOf(seatId);
  if (index === -1) {
    if (selectedSeats.length >= 8) {
      showError("Ek baar mein max 8 seats hi book ho sakti hain.");
      return;
    }
    selectedSeats.push(seatId);
    element.classList.add("selected");
  } else {
    selectedSeats.splice(index, 1);
    element.classList.remove("selected");
  }
  showError("");
  updateSummary();
}

// Total price + selected seats dikhao
function updateSummary() {
  let total = 0;
  selectedSeats.forEach(function (s) {
    total += seatPrice(movie, s);
  });

  document.getElementById("sumSeats").textContent =
    selectedSeats.length ? selectedSeats.slice().sort().join(", ") : "-";
  document.getElementById("sumTotal").textContent = "₹" + total;
  confirmBtn.disabled = selectedSeats.length === 0;
}

function showError(msg) {
  errorMsg.textContent = msg;
}

// Confirm button
confirmBtn.addEventListener("click", function () {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();

  if (name.length < 2) return showError("Apna naam daal (kam se kam 2 letters).");
  if (!/^[0-9]{10}$/.test(phone)) return showError("Phone number 10 digit ka hona chahiye.");

  // Last check: kisi aur tab mein seat book to nahi ho gayi?
  const bookedNow = getBookedSeats(movie.id, selectedDate, selectedTime);
  const clash = selectedSeats.filter(function (s) { return bookedNow.has(s); });
  if (clash.length) {
    selectedSeats = [];
    renderSeats();
    return showError("Seats " + clash.join(", ") + " abhi book ho chuki hain. Dobara chuno.");
  }

  let total = 0;
  selectedSeats.forEach(function (s) { total += seatPrice(movie, s); });

  const booking = {
    id: "TB" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    movieId: movie.id,
    movieTitle: movie.title,
    date: selectedDate,
    time: selectedTime,
    seats: selectedSeats.slice().sort(),
    total: total,
    name: name,
    phone: phone,
    bookedAt: new Date().toISOString()
  };

  const all = getBookings();
  all.push(booking);
  saveBookings(all);

  // Ticket page pe bhejo
  window.location.href = "confirm.html?id=" + booking.id;
});

/* ---------------- Start ---------------- */
if (!movie) {
  document.getElementById("bookingMain").innerHTML =
    '<p class="seat-msg">Movie nahi mili 😕 <a href="index.html" style="color:var(--accent)">Home pe wapas ja</a></p>';
} else {
  document.title = "Book " + movie.title + " - TicketBooker";
  renderHeader();
  renderDates();
  renderTimes();
  renderSeats();
}
