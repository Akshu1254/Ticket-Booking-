# 🎟️ TicketBooker - Online Movie Ticket Booking

Ek simple movie ticket booking website jo HTML, CSS aur JavaScript se bani hai.
Koi backend nahi hai - saara data browser ke `localStorage` mein save hota hai.

**Live Demo:** https://TERA-USERNAME.github.io/ticket-booker/

## ✨ Features

- Movies ki list (search + genre filter)
- Date aur show time select karna
- Seat map (Available / Premium / Selected / Booked)
- Total price automatic calculate hota hai
- Naam + phone validation
- Booking ke baad ticket generate (Booking ID ke saath)
- Ticket print kar sakte ho
- "My Bookings" mein purani bookings dekho aur cancel karo
- Mobile friendly design

## 📁 Folder Structure

```
ticket-booker/
├── index.html        # Home page
├── booking.html      # Seat selection page
├── confirm.html      # Ticket page
├── css/style.css     # Styling
├── js/
│   ├── data.js       # Movies data + helper functions
│   ├── main.js       # Home page logic
│   ├── booking.js    # Seat selection logic
│   └── confirm.js    # Ticket logic
└── images/           # (optional) posters/logo
```

## ▶️ Kaise chalana hai

1. Repo download/clone kar
2. `index.html` ko browser mein khol - bas!

(Ya VS Code mein "Live Server" extension use kar.)

## 🛠️ Tech Used

HTML5, CSS3, JavaScript (Vanilla), localStorage

## 🚀 Aage ke ideas

- Login / Signup
- Real backend (Node.js + Express + MongoDB)
- Payment gateway (Razorpay test mode)
- QR code ticket
- Admin panel se movies add karna

## ⚠️ Note

Ye ek demo project hai. Payment asli nahi hota aur data sirf tere browser mein save hota hai.
