# TicketBooker Razorpay backend

## Deployment
1. Push this repository to GitHub.
2. In Render choose **New + → Blueprint** and select this repository. Render reads the root `render.yaml`.
3. In the created service Environment settings add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Start with Razorpay Test Mode keys. Never put the Key Secret in frontend files or GitHub.
4. Wait for deployment and open `https://YOUR-SERVICE.onrender.com/api/health`. It should return `{"ok":true,...}`.
5. Replace `https://YOUR-RENDER-SERVICE.onrender.com` in root `payment.html` variable `TICKETBOOKER_API_BASE` with the actual Render service URL and commit.
6. Test using Razorpay Test Mode. Ensure automatic capture is enabled so the backend can confirm captured payments.
7. Switch to Live Mode keys only after test payments pass and Razorpay has activated your account for live payments.

## Local
```bash
cd backend
npm install
cp .env.example .env
# Add test credentials to .env (never commit it)
npm start
```

The server calculates the amount from its own movie price table, creates Razorpay Orders, validates the checkout HMAC signature, fetches the payment from Razorpay, checks the exact amount/currency/order and issues a ticket only for a captured payment. SQLite data is persisted on Render's configured disk.
