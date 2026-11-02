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
    title: "Galaxy Raiders",
    genre: "Sci-Fi",
    language: "Hindi",
    duration: "2h 25m",
    rating: 8.2,
    price: 250,
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #1e3a8a, #7c3aed)",
    timings: ["10:00 AM", "01:30 PM", "06:00 PM", "09:30 PM"],
    description: "Ek space crew duniya bachane ke liye ek anjaan galaxy mein jaata hai."
  },
  {
    id: 2,
    title: "Mumbai Nights",
    genre: "Thriller",
    language: "Hindi",
    duration: "2h 10m",
    rating: 7.8,
    price: 220,
    emoji: "🌃",
    gradient: "linear-gradient(135deg, #111827, #dc2626)",
    timings: ["11:00 AM", "02:30 PM", "07:00 PM", "10:15 PM"],
    description: "Ek raat, ek shehar aur ek raaz jo sab kuch badal dega."
  },
  {
    id: 3,
    title: "Shaadi Ka Chakkar",
    genre: "Comedy",
    language: "Hindi",
    duration: "2h 00m",
    rating: 7.4,
    price: 200,
    emoji: "💍",
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899)",
    timings: ["10:30 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
    description: "Shaadi se pehle ke 3 din, aur ho gaye ek se badh kar ek gadbad."
  },
  {
    id: 4,
    title: "Dragon Realm",
    genre: "Fantasy",
    language: "English",
    duration: "2h 40m",
    rating: 8.6,
    price: 300,
    emoji: "🐉",
    gradient: "linear-gradient(135deg, #065f46, #f97316)",
    timings: ["09:45 AM", "01:15 PM", "05:00 PM", "09:00 PM"],
    description: "Ek ladka aur ek dragon milke saaltanat ko bachane nikalte hain."
  },
  {
    id: 5,
    title: "Haunted Haveli",
    genre: "Horror",
    language: "Hindi",
    duration: "1h 55m",
    rating: 7.1,
    price: 230,
    emoji: "👻",
    gradient: "linear-gradient(135deg, #0f172a, #475569)",
    timings: ["12:00 PM", "03:00 PM", "06:30 PM", "10:30 PM"],
    description: "Purani haveli mein ek raat rukna dosto ko bahut mehnga pad gaya."
  },
  {
    id: 6,
    title: "Pyaar Ki Dhun",
    genre: "Romance",
    language: "Hindi",
    duration: "2h 20m",
    rating: 7.9,
    price: 210,
    emoji: "🎶",
    gradient: "linear-gradient(135deg, #be185d, #fb7185)",
    timings: ["10:00 AM", "01:45 PM", "05:15 PM", "08:45 PM"],
    description: "Ek singer aur ek painter ki dil ko chhu lene wali kahani."
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
