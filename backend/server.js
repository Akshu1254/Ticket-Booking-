const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://akshu1254.github.io";

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN.split(",").map(value => value.trim()), methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "12kb" }));
app.use("/api/", rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }));

// Keep these prices in sync with data.js. The server, not the browser, calculates the payable amount.
const MOVIE_PRICES = {
  1:220, 2:230, 3:250, 4:220, 5:200, 6:210, 7:220, 8:280, 9:300,
  10:320, 11:260, 12:250, 13:230, 14:200, 15:210, 16:300, 17:320
};
const PREMIUM_ROWS = new Set(["G", "H"]);
const PREMIUM_EXTRA = 100;

function calculateAmount(movieId, seats) {
  const basePrice = MOVIE_PRICES[Number(movieId)];
  if (!basePrice || !Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
    throw new Error("Invalid movie or seat selection.");
  }
  const uniqueSeats = [...new Set(seats)];
  if (uniqueSeats.length !== seats.length) throw new Error("Duplicate seats are not allowed.");
  let total = 0;
  for (const seat of seats) {
    if (typeof seat !== "string" || !/^[A-H](10|[1-9])$/.test(seat)) throw new Error("Invalid seat selection.");
    total += basePrice + (PREMIUM_ROWS.has(seat[0]) ? PREMIUM_EXTRA : 0);
  }
  return total * 100; // Razorpay expects paise
}

async function razorpayRequest(path, method, body) {
  const auth = Buffer.from(KEY_ID + ":" + KEY_SECRET).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1" + path, {
    method,
    headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.description || "Razorpay API request failed.");
  return data;
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "TicketBooker payment API" }));

app.post("/api/create-order", async (req, res) => {
  try {
    if (!KEY_ID || !KEY_SECRET) return res.status(503).json({ error: "Payment gateway is not configured on the server." });
    const { movieId, seats } = req.body || {};
    const amount = calculateAmount(movieId, seats);
    const order = await razorpayRequest("/orders", "POST", {
      amount, currency: "INR", receipt: "tb_" + crypto.randomBytes(8).toString("hex"),
      notes: { movie_id: String(movieId), seats: seats.join(",") }
    });
    res.json({ key: KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to create order." });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    if (!KEY_ID || !KEY_SECRET) return res.status(503).json({ error: "Payment gateway is not configured on the server." });
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every(value => typeof value === "string" && value.length > 5)) {
      return res.status(400).json({ verified: false, error: "Missing payment verification details." });
    }
    const expected = crypto.createHmac("sha256", KEY_SECRET).update(orderId + "|" + paymentId).digest("hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({ verified: false, error: "Payment signature is invalid." });
    }

    // Confirm payment state and amount directly with Razorpay before issuing a ticket.
    const [payment, order] = await Promise.all([
      razorpayRequest("/payments/" + encodeURIComponent(paymentId), "GET"),
      razorpayRequest("/orders/" + encodeURIComponent(orderId), "GET")
    ]);
    if (payment.order_id !== orderId || payment.status !== "captured" || order.status !== "paid" || payment.amount !== order.amount || order.amount_paid !== order.amount) {
      return res.status(400).json({ verified: false, error: "Payment is not captured for this order yet." });
    }
    res.json({ verified: true, status: "captured", paymentId, orderId, amount: payment.amount, currency: payment.currency });
  } catch (error) {
    res.status(400).json({ verified: false, error: error.message || "Payment verification failed." });
  }
});

app.listen(PORT, () => console.log("TicketBooker payment API listening on port " + PORT));