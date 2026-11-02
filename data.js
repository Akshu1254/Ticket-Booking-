/* =========================================================
   data.js  ->  Movies ka data + sab pages ke common helpers
   Is file ko sabse pehle load karna hai (har HTML mein).
   ========================================================= */

// Seat layout: 8 rows (A-H) x 10 columns
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;
// Last 2 rows premium seats hain (extra paisa)
const PREMIUM_ROWS = ["G", "H"];
const PREMIUM_EXTRA = 100;

// Movies ka data. Nayi movie add karni ho to bas ek object aur daal de.
const movies = [
  {
    id: 1,
    title: "3 Idiots",
    genre: "Comedy",
    language: "Hindi",
    duration: "2h 50m",
    rating: 8.4,
    price: 220,
    emoji: "🎓",
    gradient: "linear-gradient(135deg, #0f766e, #2563eb)",
    timings: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"],
    description: "Three engineering students challenge the pressure of college life and discover the meaning of success."
  },
  {
    id: 2,
    title: "Dangal",
    genre: "Drama",
    language: "Hindi",
    duration: "2h 41m",
    rating: 8.3,
    price: 230,
    emoji: "🤼",
    gradient: "linear-gradient(135deg, #78350f, #b45309)",
    timings: ["10:30 AM", "02:00 PM", "06:30 PM", "09:45 PM"],
    description: "A former wrestler trains his daughters to become champions against all odds."
  },
  {
    id: 3,
    title: "Jawan",
    genre: "Action",
    language: "Hindi",
    duration: "2h 49m",
    rating: 7.0,
    price: 250,
    emoji: "🔥",
    gradient: "linear-gradient(135deg, #991b1b, #1e293b)",
    timings: ["09:45 AM", "01:15 PM", "05:00 PM", "09:00 PM"],
    description: "A vigilante takes on corruption and fights for justice through a series of daring missions."
  },
  {
    id: 4,
    title: "Stree 2",
    genre: "Horror Comedy",
    language: "Hindi",
    duration: "2h 27m",
    rating: 7.0,
    price: 220,
    emoji: "👻",
    gradient: "linear-gradient(135deg, #14532d, #581c87)",
    timings: ["11:00 AM", "02:30 PM", "07:00 PM", "10:15 PM"],
    description: "The people of Chanderi face a new supernatural threat that only Stree can help defeat."
  },
  {
    id: 5,
    title: "Carry On Jatta 3",
    genre: "Comedy",
    language: "Punjabi",
    duration: "2h 15m",
    rating: 6.5,
    price: 200,
    emoji: "😂",
    gradient: "linear-gradient(135deg, #b45309, #be185d)",
    timings: ["10:00 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
    description: "A Punjabi comedy of mistaken identities, family drama and chaotic wedding plans."
  },
  {
    id: 6,
    title: "Honsla Rakh",
    genre: "Comedy Drama",
    language: "Punjabi",
    duration: "2h 26m",
    rating: 6.5,
    price: 210,
    emoji: "❤️",
    gradient: "linear-gradient(135deg, #9d174d, #ea580c)",
    timings: ["10:15 AM", "01:45 PM", "05:15 PM", "08:45 PM"],
    description: "A single father raises his son while navigating unexpected turns in his love life."
  },
  {
    id: 7,
    title: "Jatt & Juliet 3",
    genre: "Romance Comedy",
    language: "Punjabi",
    duration: "2h 15m",
    rating: 7.0,
    price: 220,
    emoji: "💞",
    gradient: "linear-gradient(135deg, #7c3aed, #db2777)",
    timings: ["09:30 AM", "12:45 PM", "04:15 PM", "07:45 PM"],
    description: "Two police officers find themselves caught between duty, misunderstandings and romance."
  },
  {
    id: 8,
    title: "Inception",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 28m",
    rating: 8.8,
    price: 280,
    emoji: "🌀",
    gradient: "linear-gradient(135deg, #1e3a8a, #334155)",
    timings: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"],
    description: "A skilled thief enters people's dreams to plant an idea deep inside their subconscious."
  },
  {
    id: 9,
    title: "Interstellar",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 49m",
    rating: 8.7,
    price: 300,
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #172554, #713f12)",
    timings: ["09:45 AM", "01:15 PM", "05:00 PM", "09:00 PM"],
    description: "A team of explorers travels beyond this galaxy to find a future for humanity."
  },
  {
    id: 10,
    title: "Avengers: Endgame",
    genre: "Action",
    language: "English",
    duration: "3h 01m",
    rating: 8.4,
    price: 320,
    emoji: "🦸",
    gradient: "linear-gradient(135deg, #7f1d1d, #1e40af)",
    timings: ["10:30 AM", "02:00 PM", "06:00 PM", "09:30 PM"],
    description: "The remaining Avengers unite for one final mission to restore the universe."
  },
  {
    id: 11,
    title: "Jurassic World",
    genre: "Adventure",
    language: "English",
    duration: "2h 04m",
    rating: 7.0,
    price: 260,
    emoji: "🦖",
    gradient: "linear-gradient(135deg, #14532d, #854d0e)",
    timings: ["10:00 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
    description: "A dinosaur theme park turns into a fight for survival when a genetically modified dinosaur escapes."
  },

  {
    id: 12,
    title: "Pathaan",
    genre: "Action",
    language: "Hindi",
    duration: "2h 26m",
    rating: 5.8,
    price: 250,
    emoji: "🕶️",
    gradient: "linear-gradient(135deg, #1e3a8a, #b91c1c)",
    timings: ["10:15 AM", "01:45 PM", "05:15 PM", "08:45 PM"],
    description: "An exiled agent returns to stop a dangerous threat against the country."
  },
  {
    id: 13,
    title: "Drishyam 2",
    genre: "Thriller",
    language: "Hindi",
    duration: "2h 20m",
    rating: 8.2,
    price: 230,
    emoji: "🧩",
    gradient: "linear-gradient(135deg, #334155, #166534)",
    timings: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"],
    description: "A family faces a new investigation as a hidden truth threatens to surface."
  },
  {
    id: 14,
    title: "Shadaa",
    genre: "Romance Comedy",
    language: "Punjabi",
    duration: "2h 8m",
    rating: 6.5,
    price: 200,
    emoji: "💐",
    gradient: "linear-gradient(135deg, #be185d, #f59e0b)",
    timings: ["10:30 AM", "01:30 PM", "05:00 PM", "08:30 PM"],
    description: "A bachelor faces family pressure and unexpected complications while looking for love."
  },
  {
    id: 15,
    title: "Saunkan Saunkanay",
    genre: "Comedy",
    language: "Punjabi",
    duration: "2h 10m",
    rating: 6.5,
    price: 210,
    emoji: "🤣",
    gradient: "linear-gradient(135deg, #c2410c, #7e22ce)",
    timings: ["09:45 AM", "12:45 PM", "04:15 PM", "07:45 PM"],
    description: "A lively Punjabi comedy about a family relationship that turns into comic chaos."
  },
  {
    id: 16,
    title: "The Dark Knight",
    genre: "Action",
    language: "English",
    duration: "2h 32m",
    rating: 9.0,
    price: 300,
    emoji: "🦇",
    gradient: "linear-gradient(135deg, #111827, #374151)",
    timings: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"],
    description: "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos."
  },
  {
    id: 17,
    title: "Avatar: The Way of Water",
    genre: "Adventure",
    language: "English",
    duration: "3h 12m",
    rating: 7.5,
    price: 320,
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #0369a1, #0f766e)",
    timings: ["09:30 AM", "01:15 PM", "05:30 PM", "09:15 PM"],
    description: "Jake Sully and his family seek refuge with the ocean clan of Pandora."
  }
];

/* ---------------- Helper functions ---------------- */

// localStorage se saari bookings nikalo
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem("bookings")) || [];
  } catch (e) {
    return [];
  }
}

// bookings wapas localStorage mein save karo
function saveBookings(list) {
  localStorage.setItem("bookings", JSON.stringify(list));
}

// Ek string ka number (hash) banata hai - fake "pehle se booked" seats ke liye
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Kisi show (movie + date + time) ki booked seats ka Set return karta hai
function getBookedSeats(movieId, date, time) {
  const booked = new Set();
  const key = movieId + "|" + date + "|" + time;

  // 1) Demo ke liye kuch seats pehle se booked dikhao (har show ke liye fixed)
  ROWS.forEach(function (row) {
    for (let c = 1; c <= COLS; c++) {
      const seat = row + c;
      if (hashString(key + seat) % 100 < 20) booked.add(seat);
    }
  });

  // 2) User ne jo seats book ki hain wo bhi add karo
  getBookings().forEach(function (b) {
    if (b.movieId === movieId && b.date === date && b.time === time) {
      b.seats.forEach(function (s) { booked.add(s); });
    }
  });

  return booked;
}

// Ek seat ka price (premium rows mein extra)
function seatPrice(movie, seat) {
  const row = seat.charAt(0);
  return PREMIUM_ROWS.includes(row) ? movie.price + PREMIUM_EXTRA : movie.price;
}

// User ka likha text HTML mein safe dikhane ke liye
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// "2026-11-03" -> "Tue, 3 Nov"
function prettyDate(value) {
  const parts = value.split("-");
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
