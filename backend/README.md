# TicketBooker Razorpay backend

## Deploy on Render
1. Push this repository to GitHub.
2. In Render choose **New + → Blueprint**, select this repository, and apply the `render.yaml` blueprint.
3. In the service Environment settings add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Start with Razorpay Test Mode keys. Never add the Key Secret to frontend files or GitHub.
4. Wait for deployment and open `https://YOUR-SERVICE.onrender.com/health`. It should return `{"ok":true,"service":"TicketBooker Razorpay API"}`.
5. Replace `https://YOUR-RENDER-SERVICE.onrender.com` in root `payment.html` variable `TICKETBOOKER_API_BASE` with the actual Render URL and commit.
6. Test the complete flow with Razorpay Test Mode. Enable automatic capture in Razorpay so a successful payment reaches captured status.
7. After test payments pass and your Razorpay account is activated, change the Render environment variables to Live Mode keys.

## Local run
```bash
cd backend
npm install
# Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your shell environment
npm start
```

The backend calculates ticket prices itself, creates Razorpay Orders, verifies the checkout HMAC signature, fetches the order and payment directly from Razorpay, and issues a ticket only when the exact expected amount is captured. Order details are stored in Razorpay order notes, so the free Render filesystem does not need to persist a local database. Free Render services may sleep when idle and take time to wake up.
