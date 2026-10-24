# GHAR TAK

GHAR TAK is a local-shopping app with a React/Vite frontend and an Express,
MongoDB, and Mongoose API.

## Run locally

1. In one terminal, run `cd backend`, then `npm install`.
2. Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI`,
   `JWT_SECRET`, and the mail credentials. A Gmail app password is required to
   send registration verification and password-reset emails.
3. Start the API from the `backend` folder with `npm run dev` (or `npm start`).
4. In another terminal, run `cd frontend`, then `npm install` and `npm run dev`.
5. Open the Vite URL printed in the terminal. Vite proxies `/api` to
   `http://localhost:5000` in development.

## Connected features

- Customer and shop-owner registration with email OTP verification.
- Role-aware login, protected account pages, password recovery, and password
  changes.
- Product and shop discovery, saved products, server-side carts, COD checkout,
  order history, and saved delivery addresses.
- Owner shop details, product/category management, order status updates, and
  account settings.

The API health check is available at `/api/health`. For a deployed frontend,
set `VITE_API_URL` to the backend API base URL and set `FRONTEND_URL` on the
backend to the frontend origin.