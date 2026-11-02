/* =========================================================
   main.js -> Home page (index.html) ka logic
   - movies ki list dikhana
   - search + genre filter
   - "My Bookings" popup (cancel option ke saath)
   ========================================================= */

const movieList = document.getElementById("movieList");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const noResult = document.getElementById("noResult");

// Genre dropdown movies ke data se khud bhar do
function fillGenres() {
  const genres = [];
  movies.forEach(function (m) {
    if (!genres.includes(m.genre)) genres.push(m.genre);
  });
  genres.forEach(function (g) {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreFilter.appendChild(opt);
  });
}

// Movie cards screen pe banao (search/filter ke hisaab se)
function renderMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const genre = genreFilter.value;

  const filtered = movies.filter(function (m) {
    const matchName = m.title.toLowerCase().includes(query);
    const matchGenre = genre === "all" || m.genre === genre;
    return matchName && matchGenre;
  });

  movieList.innerHTML = filtered
    .map(function (m) {
      return (
        '<div class="movie-card">' +
        '<div class="poster" style="background:' + m.gradient + '">' + m.emoji + "</div>" +
        '<div class="movie-info">' +
        "<h3>" + m.title + "</h3>" +
        '<p class="meta">' + m.genre + " • " + m.language + " • " + m.duration + "</p>" +
        '<p class="rating">⭐ ' + m.rating + "/10</p>" +
        '<div class="price-row">' +
        "<span>₹" + m.price + " onwards</span>" +
        '<a class="btn" href="booking.html?id=' + m.id + '">Book Now</a>' +
        "</div></div></div>"
      );
    })
    .join("");

  noResult.classList.toggle("hidden", filtered.length > 0);
}

/* ---------------- My Bookings popup ---------------- */
const modal = document.getElementById("bookingsModal");
const bookingsList = document.getElementById("bookingsList");

function renderBookings() {
  const bookings = getBookings().slice().reverse(); // latest pehle

  if (bookings.length === 0) {
    bookingsList.innerHTML = '<p class="meta" style="margin-top:12px">You have no bookings yet.</p>';
    return;
  }

  bookingsList.innerHTML = bookings
    .map(function (b) {
      return (
        '<div class="booking-item">' +
        "<h4>" + escapeHTML(b.movieTitle) + "</h4>" +
        "<p>" + prettyDate(b.date) + " • " + b.time + "</p>" +
        "<p>Seats: " + b.seats.join(", ") + " • Total: ₹" + b.total + "</p>" +
        "<p>ID: " + b.id + "</p>" +
        '<div class="booking-actions">' +
        '<a class="btn btn-small" href="confirm.html?id=' + b.id + '">View Ticket</a>' +
        '<button class="btn btn-small btn-outline" data-cancel="' + b.id + '">Cancel</button>' +
        "</div></div>"
      );
    })
    .join("");
}

document.getElementById("myBookingsLink").addEventListener("click", function (e) {
  e.preventDefault();
  renderBookings();
  modal.classList.remove("hidden");
});

document.getElementById("closeModal").addEventListener("click", function () {
  modal.classList.add("hidden");
});

// Bahar click karne pe bhi popup band ho
modal.addEventListener("click", function (e) {
  if (e.target === modal) modal.classList.add("hidden");
});

// Cancel button (event delegation)
bookingsList.addEventListener("click", function (e) {
  const id = e.target.getAttribute("data-cancel");
  if (!id) return;
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  const remaining = getBookings().filter(function (b) { return b.id !== id; });
  saveBookings(remaining);
  renderBookings();
});

/* ---------------- Start ---------------- */
searchInput.addEventListener("input", renderMovies);
genreFilter.addEventListener("change", renderMovies);

fillGenres();
renderMovies();
