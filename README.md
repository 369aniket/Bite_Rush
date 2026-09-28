# 🍔 BiteRush — Real-Time Food Delivery & Dispatch Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2F6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)]()

> **BiteRush** is a high-performance, event-driven food ordering, restaurant kitchen management, and automated rider dispatch microservices ecosystem. Built with the **MERN** stack, **TypeScript**, **RabbitMQ message queuing**, and **Socket.IO bidirectional duplex channels**, BiteRush solves the real-world operational challenges of multi-role food delivery with zero-latency status broadcasts, geospatial pilot matching, automated payment reconciliation, and granular courier earnings analytics.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏛️ System Architecture](#️-system-architecture)
- [⚡ Event-Driven Real-Time Lifecycle](#-event-driven-real-time-lifecycle)
- [📦 Microservices Ecosystem](#-microservices-ecosystem)
- [🛠️ Tech Stack Breakdown](#-tech-stack-breakdown)
- [🔄 End-to-End Order Workflow](#-end-to-end-order-workflow)
- [📂 Directory Tree](#-directory-tree)
- [📡 API Reference](#-api-reference)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Getting Started & Local Setup](#-getting-started--local-setup)
- [🔮 Future Roadmap](#-future-roadmap)
- [🤝 Contributing & License](#-contributing--license)
- [👨‍💻 Author](#-author)

---

## ✨ Key Features

### 🛒 1. Customer Experience
* **Restaurant Discovery & Menus:** Real-time restaurant browsing, category filtering, search, and dynamic menu item exploration.
* **Smart Cart & Address Management:** Persistent cart state synchronized with backend models and GPS-assisted geocoded delivery address selection.
* **Multi-Gateway Checkout:** Seamless online payments using **Razorpay** and **Stripe**, backed by resilient asynchronous webhook/consumer verification.
* **Interactive Live Order Tracking:** Real-time order progress updates and live courier route visualization powered by **Leaflet & OpenStreetMap**.

### 👨‍🍳 2. Restaurant Partner Kitchen Display System (KDS)
* **Live Order Notification:** Instant audible/visual alerts on incoming orders via Socket.IO room subscriptions (`restaurant:<restaurantId>`).
* **Order Lifecycle Control:** Step-by-step order state transitions (`accepted` ➔ `preparing` ➔ `ready_for_rider`).
* **Menu & Inventory Management:** Upload and manage menu items, pricing, veg/non-veg tags, and item images with automatic Cloudinary optimization.
* **Restaurant Profile & KYC:** Custom restaurant branding, operating hours, delivery radius, and administrative onboarding submission.

### 🛵 3. Delivery Partner (Rider Pilot Console)
* **Duty Toggle:** One-tap online/offline toggle to control availability for delivery dispatches.
* **Geospatial Radar Dispatching:** Automated driver matching using MongoDB `$near` 2dsphere indexing within a dynamic radius of the restaurant.
* **Real-Time Order Radar:** Interactive modal alerts when an order is ready for pickup, with order values, distances, and pickup/delivery routes.
* **Turn-by-Turn Navigation:** Live routing machine integration on map canvas showing restaurant to customer path.
* **Dedicated Rider Earnings Portal (`/my-earnings`):** Comprehensive financial metrics tracking:
  * 💰 **Total Lifetime Payout**
  * ⚡ **Today's Shift Earnings**
  * 📈 **Weekly Performance Revenue**
  * 🛣️ **Total Kilometers Driven**
  * 📜 **Delivered Trips History:** Detailed records of every completed delivery (customer address, order amount, timestamp, earnings per trip).

### 🛡️ 4. Platform Administration & Security
* **Role-Based Access Control (RBAC):** Strict boundaries across four user roles: `user`, `seller`, `rider`, and `admin`.
* **KYC & Document Verification:** Admin dashboard to audit and approve/reject pending restaurant profiles and rider licenses.
* **Internal Microservice Defense:** Inter-service REST requests secured with `x-internal-key` token validation to prevent unauthorized perimeter bypassing.
* **Dual Authentication:** Hybrid authentication supporting email/password JWT tokens and **Google OAuth 2.0** SSO.

---

## 🏛️ System Architecture

BiteRush separates concerns through an event-driven microservices architecture. Client communications interface with designated microservices, while inter-service tasks leverage **RabbitMQ** for asynchronous tasks and **Socket.IO** for live multi-room broadcasts.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      REACT + TYPESCRIPT CLIENT                         │
 │        (Customer Portal | Restaurant KDS | Rider Radar | Admin)         │
 └──────┬───────────────────┬─────────────────────┬────────────────┬──────┘
        │                   │                     │                │
        │ HTTP / REST       │ Socket.IO Client    │ HTTP / REST    │ HTTP / REST
        ▼                   ▼                     ▼                ▼
 ┌──────────────┐    ┌──────────────┐     ┌──────────────┐  ┌──────────────┐
 │ AUTH SERVICE │    │ REALTIME     │     │ RESTAURANT   │  │ RIDER        │
 │  (Port 5000) │    │ SERVICE      │     │ SERVICE      │  │ SERVICE      │
 │              │    │ (Port 5005)  │     │ (Port 5001)  │  │ (Port 5004)  │
 └──────┬───────┘    └──────▲───────┘     └──────┬───────┘  └──────┬───────┘
        │                   │                    │                 │
        │                   │ HTTP Internal Emit │                 │
        │                   │ (x-internal-key)   │                 │
        │                   ├────────────────────┴─────────────────┤
        │                   │                                      │
        ▼                   ▼                                      ▼
 ┌──────────────┐    ┌──────────────────────────────────┐   ┌──────────────┐
 │ MONGODB      │    │         RABBITMQ BROKER          │   │ UTILS        │
 │ AUTH CLUSTER │    │   - PAYMENT_QUEUE                │   │ SERVICE      │
 └──────────────┘    │   - ORDER_READY_QUEUE            │   │ (Port 5002)  │
                     └──────┬────────────────────▲──────┘   │  - Cloudinary│
                            │                    │          │  - Razorpay  │
                            ▼                    └──────────┤  - Stripe    │
                     ┌──────────────┐                       └──────────────┘
                     │ ADMIN        │
                     │ SERVICE      │
                     │ (Port 5006)  │
                     └──────────────┘
```

---

## ⚡ Event-Driven Real-Time Lifecycle

### WebSocket Channels & Socket.IO Rooms

Every authenticated client joining the Socket.IO server automatically enters an isolated room based on their verified JWT token:
- `user:<userId>` — Personal room for live order state transitions and rider push alerts.
- `restaurant:<restaurantId>` — Dedicated kitchen room for incoming orders and driver assignment notifications.

### Event Flow Matrix

| Event Name | Emitted By | Listened By | Payload / Schema | Description |
| :--- | :--- | :--- | :--- | :--- |
| `order:new` | Restaurant Consumer | Restaurant KDS (`restaurant:<id>`) | `{ orderId: string }` | Emitted when payment succeeds; new order card populates in kitchen. |
| `order:available` | Rider Consumer | Rider Pilots (`user:<riderId>`) | `{ orderId: string, restaurantId: string }` | Targeted alert to nearby verified riders when food is cooked. |
| `order:rider_assigned`| Restaurant Service | Customer & Restaurant | `{ orderId: string, rider: object }` | Triggered when a pilot accepts the delivery dispatch. |
| `order:update` | Restaurant / Rider | Customer (`user:<userId>`) | `{ orderId: string, status: string }` | Real-time status update (`preparing`, `picked_up`, `delivered`). |
| `rider:location` | Rider Client | Customer Tracking Map | `{ orderId: string, lat: number, lng: number }` | Real-time GPS coordinate stream rendering pilot's vehicle on Leaflet. |

---

## 📦 Microservices Ecosystem

| Microservice | Default Port | Primary Responsibilities |
| :--- | :---: | :--- |
| **`services/auth`** | `5000` | User registration, JWT generation, Google OAuth 2.0 verification, role switching, user profile queries. |
| **`services/restaurant`**| `5001` | Restaurant profiles, menu catalog, cart calculations, address management, order state machine, RabbitMQ payment consumer. |
| **`services/utils`** | `5002` | Payment order creation (Razorpay/Stripe), payment signature verification, RabbitMQ message publication, Cloudinary file uploads. |
| **`services/rider`** | `5004` | Courier profiles, duty toggle, MongoDB 2dsphere location matching, order acceptance, RabbitMQ `ORDER_READY` consumer, rider earnings & trip metrics. |
| **`services/realtime`** | `5005` | WebSocket lifecycle, JWT handshake verification, dynamic room multicasting, internal HTTP emit gateway (`/api/v1/internal/emit`). |
| **`services/admin`** | `5006` | Verification queue for partner restaurants and delivery riders, administrative access control. |
| **`client`** | `5173` | React 19 single-page application with responsive layouts for Customers, Sellers, Riders, and Admins. |

---

## 🛠️ Tech Stack Breakdown

### Frontend
- **Library & Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, Lucide & React Icons (`react-icons`)
- **Maps & Geolocation:** Leaflet, React Leaflet, Leaflet Routing Machine, Browser Geolocation API
- **Real-Time Client:** Socket.IO Client
- **State & Routing:** React Router v7, Custom React Context (`AppContext`, `SocketContext`)
- **Payment Elements:** Stripe JS, Razorpay Checkout SDK
- **Notifications:** React Hot Toast

### Backend & Microservices
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js (v5)
- **Language:** TypeScript
- **Database ORM:** Mongoose / MongoDB Atlas (Geospatial 2dsphere indexes)
- **Message Broker:** RabbitMQ (`amqplib`)
- **Real-Time Server:** Socket.IO Server
- **Media Storage:** Cloudinary SDK, Multer, DataURI
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), Google OAuth 2.0 (`@react-oauth/google`)
- **Process Orchestration:** Concurrently (Development TypeScript watch & node watch)

---

## 🔄 End-to-End Order Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Client as React App
    participant Utils as Utils Service (5002)
    participant Broker as RabbitMQ Broker
    participant Restaurant as Restaurant Service (5001)
    participant Realtime as Realtime Service (5005)
    actor Kitchen as Restaurant Partner
    participant RiderSvc as Rider Service (5004)
    actor Rider as Courier Pilot

    Customer->>Client: Place Order & Pay (Razorpay/Stripe)
    Client->>Utils: POST /api/v1/payment/create-order
    Utils-->>Client: Returns Payment Gateway Credentials
    Customer->>Client: Completes Payment Challenge
    Client->>Utils: POST /api/v1/payment/verify
    Utils->>Broker: Publish PAYMENT_SUCCESS to PAYMENT_QUEUE
    Broker->>Restaurant: Payment Consumer ingests event
    Restaurant->>Restaurant: Update Order: paymentStatus="paid", status="placed"
    Restaurant->>Realtime: POST /internal/emit (event: order:new)
    Realtime->>Kitchen: WebSocket Broadcast to room `restaurant:<id>`
    Kitchen->>Restaurant: PUT /api/v1/order/:id (status: "preparing")
    Restaurant->>Realtime: Broadcast status "preparing" to Customer
    Kitchen->>Restaurant: PUT /api/v1/order/:id (status: "ready_for_rider")
    Restaurant->>Broker: Publish ORDER_READY_FOR_RIDER to ORDER_READY_QUEUE
    Broker->>RiderSvc: Order Ready Consumer ingests event
    RiderSvc->>RiderSvc: Find online verified riders via MongoDB $near
    RiderSvc->>Realtime: POST /internal/emit (event: order:available)
    Realtime->>Rider: Radar Pop-up appears on Rider Dashboard
    Rider->>RiderSvc: POST /api/v1/rider/accept/:orderId
    RiderSvc->>Restaurant: PUT /api/v1/order/assign/rider (Internal)
    Restaurant->>Realtime: Broadcast order:rider_assigned to Customer & Kitchen
    Rider->>RiderSvc: PUT /api/v1/rider/order/update/:id (picked_up)
    Rider->>Realtime: Stream rider:location GPS coordinates to Customer Map
    Rider->>RiderSvc: PUT /api/v1/rider/order/update/:id (delivered)
    RiderSvc->>Restaurant: Finalize Order as "delivered"
    Restaurant->>Realtime: Broadcast final "delivered" status
    Rider->>Client: Navigates to /my-earnings (Payout, Today Shift & History auto-updated)
```

---

## 📂 Directory Tree

```text
BiteRush/
├── client/                                  # React 19 + TypeScript + Vite Frontend
│   ├── public/                              # Public static assets
│   ├── src/
│   │   ├── assets/                          # Images, sounds, and brand assets
│   │   ├── components/                      # Modular UI components
│   │   │   ├── AddMenuItem.tsx              # Kitchen menu creator modal
│   │   │   ├── AddRestaurant.tsx            # Restaurant onboarding form
│   │   │   ├── AdminRestaurantCart.tsx      # Admin review cards for restaurants
│   │   │   ├── AdminRiderCart.tsx           # Admin review cards for couriers
│   │   │   ├── MenuItem.tsx                 # Customer food item card
│   │   │   ├── Navbar.tsx                   # Responsive header navigation
│   │   │   ├── OrderCart.tsx                # Floating checkout cart widget
│   │   │   ├── protectedRoutes.tsx          # JWT Auth guard
│   │   │   ├── publicRoutes.tsx             # Public route guard
│   │   │   ├── RestaurantCard.tsx           # Restaurant listing presentation
│   │   │   ├── RestaurantOrders.tsx         # Kitchen KDS live order board
│   │   │   ├── RestaurantProfile.tsx        # Seller settings & status
│   │   │   ├── RiderCurrentOrder.tsx        # Active delivery HUD & actions
│   │   │   ├── RiderOrderMap.tsx            # Pilot navigation map (Leaflet)
│   │   │   ├── RiderOrderRequest.tsx        # Real-time incoming delivery radar modal
│   │   │   └── UserOrderMap.tsx             # Customer live courier tracking map
│   │   ├── context/
│   │   │   ├── AppContext.tsx               # Global user, cart, & auth state
│   │   │   └── SocketContext.tsx            # Global WebSocket lifecycle provider
│   │   ├── pages/
│   │   │   ├── Account.tsx                  # User profile & saved details
│   │   │   ├── Address.tsx                  # GPS delivery address manager
│   │   │   ├── Admin.tsx                    # Platform administration console
│   │   │   ├── CartPage.tsx                 # Detailed basket review
│   │   │   ├── Checkout.tsx                 # Payment gateway selector
│   │   │   ├── Home.tsx                     # Restaurant discovery homepage
│   │   │   ├── Login.tsx                    # Dual Auth (JWT + Google OAuth)
│   │   │   ├── OrderPage.tsx                # Single order live tracking cockpit
│   │   │   ├── Orders.tsx                   # Order history
│   │   │   ├── OrderSuccess.tsx             # Post-checkout celebration view
│   │   │   ├── PaymentSuccess.tsx           # Payment verification landing page
│   │   │   ├── Restaurant.tsx               # Seller operations dashboard
│   │   │   ├── RestaurantPage.tsx           # Restaurant menu page
│   │   │   ├── RiderDashboard.tsx           # Pilot duty console & radar
│   │   │   ├── RiderEarnings.tsx            # Pilot earnings, metrics & trip ledger
│   │   │   └── SelectRole.tsx               # User role switcher (Customer/Seller/Rider)
│   │   ├── utils/                           # Client helpers & formatters
│   │   ├── App.tsx                          # App root with role-based routing
│   │   ├── main.tsx                         # Client mount with providers
│   │   └── types.ts                         # Universal TypeScript interface definitions
│   ├── package.json
│   └── vite.config.ts
│
├── services/                                # Independent Microservices Backend
│   ├── admin/                               # Port 5006: Platform Admin Service
│   │   └── src/
│   │       ├── controllers/admin.controller.ts
│   │       ├── middlewares/isAuth.ts
│   │       ├── routes/admin.routes.ts
│   │       └── index.ts
│   │
│   ├── auth/                                # Port 5000: User & Auth Service
│   │   └── src/
│   │       ├── controllers/auth.controller.ts
│   │       ├── middlewares/isAuth.ts
│   │       ├── models/User.model.ts
│   │       ├── routes/auth.route.ts
│   │       └── index.ts
│   │
│   ├── realtime/                            # Port 5005: Socket.IO Server
│   │   └── src/
│   │       ├── routes/internal.ts           # Secure internal emit gateway
│   │       ├── socket.ts                    # Socket.IO connection & room logic
│   │       └── index.ts
│   │
│   ├── restaurant/                          # Port 5001: Core Restaurant & Order Service
│   │   └── src/
│   │       ├── config/
│   │       │   ├── payment.consumer.ts      # RabbitMQ payment consumer
│   │       │   └── rabbitmq.ts              # AMQP connection & channels
│   │       ├── controllers/
│   │       │   ├── address.controller.ts    # Delivery location handling
│   │       │   ├── cart.controller.ts       # Cart operations
│   │       │   ├── menu.controller.ts       # Food menu items
│   │       │   ├── order.controller.ts      # Order state machine & rider queries
│   │       │   └── restaurant.controller.ts # Restaurant onboarding & CRUD
│   │       ├── models/
│   │       │   ├── Address.model.ts
│   │       │   ├── Cart.model.ts
│   │       │   ├── Item.model.ts
│   │       │   ├── Order.model.ts
│   │       │   └── Restaurant.model.ts
│   │       ├── routes/                      # REST routes for each entity
│   │       └── index.ts
│   │
│   ├── rider/                               # Port 5004: Delivery & Courier Service
│   │   └── src/
│   │       ├── config/
│   │       │   ├── orderReady.consumer.ts   # RabbitMQ order ready consumer ($near matching)
│   │       │   └── rabbitmq.ts
│   │       ├── controllers/rider.controller.ts # Acceptance, status, & earnings logic
│   │       ├── model/Rider.model.ts         # Geospatial 2dsphere schema
│   │       ├── routes/rider.routes.ts       # Rider duty & earnings endpoints
│   │       └── index.ts
│   │
│   └── utils/                               # Port 5002: Payments & Media Utilities
│       └── src/
│           ├── config/rabbitMQ.ts           # RabbitMQ producer channel
│           ├── controllers/payment.ts       # Razorpay / Stripe verification
│           ├── routes/
│           │   ├── cloudinary.ts            # Cloudinary image upload endpoint
│           │   └── payment.ts               # Payment initiation & verify routes
│           └── index.ts
│
├── .gitignore
└── README.md
```

---

## 📡 API Reference

### 🔐 Auth Service (`5000`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate via Email/Password or Google ID Token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile & role |
| `PUT` | `/api/v1/auth/add/role` | Authenticated | Upgrade or switch role (`user`, `seller`, `rider`) |

### 🍽️ Restaurant & Orders Service (`5001`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/restaurant/all` | Public | Fetch verified restaurants |
| `POST` | `/api/v1/restaurant/new` | Seller | Onboard a new restaurant (multipart/form-data) |
| `POST` | `/api/v1/item/new` | Seller | Add a new menu item to restaurant catalog |
| `GET` | `/api/v1/cart` | Authenticated | Fetch active user shopping cart |
| `POST` | `/api/v1/cart/add` | Authenticated | Add/increment item in cart |
| `POST` | `/api/v1/order/new` | Authenticated | Initialize an order pending payment |
| `GET` | `/api/v1/order/my-orders` | Authenticated | Get all customer order histories |
| `GET` | `/api/v1/order/:id` | Authenticated | Fetch single order details |
| `PUT` | `/api/v1/order/:orderId` | Seller | Advance order status (`accepted`, `preparing`, `ready_for_rider`) |
| `GET` | `/api/v1/order/delivered/rider` | Internal | Query delivered orders & earnings for rider (`x-internal-key`) |

### 🛵 Rider Service (`5004`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/rider/new` | Authenticated | Submit rider profile, license & vehicle documents |
| `GET` | `/api/v1/rider/my-profile` | Authenticated | Fetch courier status and verification state |
| `PATCH` | `/api/v1/rider/toggle` | Authenticated | Toggle online availability (`isAvailable: true/false`) |
| `POST` | `/api/v1/rider/accept/:orderId` | Authenticated | Accept an incoming delivery request |
| `GET` | `/api/v1/rider/order/current` | Authenticated | Fetch currently active delivery HUD |
| `PUT` | `/api/v1/rider/order/update/:orderId`| Authenticated | Mark delivery as `picked_up` or `delivered` |
| `GET` | `/api/v1/rider/earnings` | Authenticated | **Get lifetime, daily, weekly payouts & completed trips** |

### 💳 Utils & Payment Service (`5002`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/upload` | Authenticated | Upload image to Cloudinary (returns secure URL) |
| `POST` | `/api/v1/payment/create-order` | Authenticated | Generate Razorpay order ID or Stripe payment intent |
| `POST` | `/api/v1/payment/verify` | Authenticated | Verify signature and publish `PAYMENT_SUCCESS` to RabbitMQ |

### 🛡️ Admin Service (`5006`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/restaurant/pending` | Admin Only | List restaurants awaiting approval |
| `GET` | `/api/v1/admin/rider/pending` | Admin Only | List riders awaiting license verification |
| `PATCH` | `/api/v1/admin/verify/restaurant/:id`| Admin Only | Approve restaurant partner status |
| `PATCH` | `/api/v1/admin/verify/rider/:id` | Admin Only | Approve courier pilot status |

### ⚡ Realtime Service (`5005`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/internal/emit` | Internal | Internal microservice webhook to dispatch Socket.IO room events |

---

## 🔑 Environment Variables

To run BiteRush locally or in production, configure the respective `.env` files in each service directory and the client root:

### 1. Client (`client/.env`)
```env
VITE_AUTH_SERVER_URL=http://localhost:5000
VITE_RESTAURANT_SERVER_URL=http://localhost:5001
VITE_UTILS_SERVER_URL=http://localhost:5002
VITE_RIDER_SERVER_URL=http://localhost:5004
VITE_REALTIME_SERVER_URL=http://localhost:5005
VITE_ADMIN_SERVER_URL=http://localhost:5006

VITE_GOOGLE_CLIENT_ID_1=your_google_oauth_client_id.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. Auth Service (`services/auth/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/biterush_auth
JWT_SECRET=your_super_secret_jwt_key
TOKEN_EXPIRY=7d
GOOGLE_CLIENT_ID_1=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET_1=your_google_oauth_client_secret
```

### 3. Restaurant Service (`services/restaurant/.env`)
```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/biterush_restaurant
JWT_SECRET=your_super_secret_jwt_key
TOKEN_EXPIRY=7d
INTERNAL_SERVICE_KEY=your_shared_internal_microservice_secret_key
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5005

RABBITMQ_URI=amqp://guest:guest@localhost:5672
PAYMENT_QUEUE=payment_queue
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

### 4. Utils Service (`services/utils/.env`)
```env
PORT=5002
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your_shared_internal_microservice_secret_key

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_api_secret

RABBITMQ_URI=amqp://guest:guest@localhost:5672
PAYMENT_QUEUE=payment_queue

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 5. Rider Service (`services/rider/.env`)
```env
PORT=5004
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/biterush_rider
JWT_SECRET=your_super_secret_jwt_key
TOKEN_EXPIRY=7d
INTERNAL_SERVICE_KEY=your_shared_internal_microservice_secret_key
RESTAURANT_SERVICE=http://localhost:5001
REALTIME_SERVICE=http://localhost:5005
UTILS_SERVICE=http://localhost:5002

RABBITMQ_URI=amqp://guest:guest@localhost:5672
ORDER_READY_QUEUE=order_ready_queue
PAYMENT_QUEUE=payment_queue
RIDER_QUEUE=rider_queue
```

### 6. Realtime Service (`services/realtime/.env`)
```env
PORT=5005
JWT_SECRET=your_super_secret_jwt_key
INTERNAL_SERVICE_KEY=your_shared_internal_microservice_secret_key
```

### 7. Admin Service (`services/admin/.env`)
```env
PORT=5006
DB_NAME=biterush_admin
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/biterush_admin
JWT_SECRET=your_super_secret_jwt_key
TOKEN_EXPIRY=7d
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js:** `>= 18.x`
* **Package Manager:** `npm` (v9+) or `yarn` / `pnpm`
* **Database:** MongoDB Community Server locally or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
* **Message Broker:** RabbitMQ running locally (`localhost:5672`) or cloud instance (e.g. CloudAMQP)
* **Cloud Accounts:**
  * [Cloudinary](https://cloudinary.com/) (image uploads)
  * [Razorpay Dashboard](https://dashboard.razorpay.com/) and/or [Stripe](https://stripe.com/)
  * [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID)

---

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone https://github.com/369aniket/biterush.git
cd biterush
```

#### 2. Install & Start Backend Services
Open separate terminal tabs or use process managers for each microservice:

```bash
# Terminal 1: Auth Service (Port 5000)
cd services/auth
npm install
npm run dev

# Terminal 2: Restaurant Service (Port 5001)
cd services/restaurant
npm install
npm run dev

# Terminal 3: Utils Service (Port 5002)
cd services/utils
npm install
npm run dev

# Terminal 4: Rider Service (Port 5004)
cd services/rider
npm install
npm run dev

# Terminal 5: Realtime Service (Port 5005)
cd services/realtime
npm install
npm run dev

# Terminal 6: Admin Service (Port 5006)
cd services/admin
npm install
npm run dev
```

#### 3. Install & Start Frontend Client
```bash
# Terminal 7: React Frontend Client (Port 5173)
cd client
npm install
npm run dev
```

#### 4. Launch Application
Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 🔮 Future Roadmap

- [x] High-performance Microservice Architecture with independent database separation
- [x] Event-driven Payment Processing via RabbitMQ consumers
- [x] Real-time duplex Socket.IO channels with dynamic user & restaurant rooms
- [x] Geospatial Pilot Radar Matching using MongoDB 2dsphere `$near` queries
- [x] Dedicated Courier Shift & Revenue Analytics (`/my-earnings`)
- [ ] **Docker Compose Pipeline:** Single `docker compose up --build` command orchestrating all microservices, RabbitMQ, and Mongo instances.
- [ ] **Push & SMS Notifications:** Automated SMS & WhatsApp notifications via Twilio / Firebase Cloud Messaging (FCM).
- [ ] **Instant Courier Payout Settlements:** Direct bank payouts using RazorpayX or Stripe Connect.
- [ ] **AI-Powered Recommendation Engine:** Gemini / LLM-assisted dish recommendations based on past ordering history and dietary preferences.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Distributed under the **ISC License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Aniket Patel**  
* GitHub: [@369aniket](https://github.com/369aniket)  
* Project Repository: [369aniket/Bite_Rush](https://github.com/369aniket/Bite_Rush)

---

<div align="center">
  <sub>Built with ❤️ and powered by modern distributed systems engineering.</sub>
</div>