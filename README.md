# 🍔 BiteRush

> A modern food delivery platform built with the MERN stack and TypeScript.

BiteRush is a full-stack microservice based food delivery application currently under active development. The project is being built with a service-oriented backend architecture and a React + TypeScript frontend.

The goal is to build a production-style food delivery platform with authentication, restaurant management, ordering, payments, and real-time order tracking.

---

## 🚧 Project Status

**Status:** In Development

BiteRush is currently under active development. Core authentication and initial restaurant-service work have been implemented, while additional services and features are being built incrementally.

---

## ✨ Currently Implemented

### 🔐 Authentication

* User authentication
* Login functionality
* Google authentication
* Protected routes
* Public routes
* Logout functionality
* Authentication state management

### 👤 Account

* Account page
* Current location detection
* User location fetching

### 🍽️ Restaurant

* Restaurant service structure
* Mongoose restaurant schema

### 🎨 Frontend

* React + TypeScript
* Vite
* Authentication UI
* Login page
* Account page
* Role selection
* Protected/public route handling

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS
* Browser Geolocation API

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose

### Authentication

* JWT-based authentication
* Google Authentication

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 🏗️ Project Architecture

BiteRush is being developed using a service-oriented backend architecture.

```text
BiteRush
│
├── client/                    # React + TypeScript frontend
│
├── services/
│   │
│   ├── auth/                  # Authentication service
│   │
│   ├── restaurant/            # Restaurant service
│   │
│   ├── order/                 # Order service (planned)
│   │
│   ├── payment/               # Payment service (planned)
│   │
│   ├── delivery/              # Delivery service (planned)
│   │
│   └── ...                    # Additional services
│
├── .gitignore
└── README.md
```

The architecture will evolve as additional services are implemented.

---

## 📂 Frontend Structure

```text
client/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔑 Environment Variables

BiteRush uses environment variables for configuration and sensitive credentials.

### Frontend

Create a `.env` file inside the `client` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend

Each backend service can have its own environment configuration.

Example:

```env
MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

> Never commit `.env` files or secret credentials to GitHub.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/369aniket/biterush.git
```

### 2. Navigate to the project

```bash
cd biterush
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

Backend services will have their own setup and startup commands as development progresses.

---

## 🗺️ Roadmap

The following features are planned for BiteRush:

* [x] User authentication
* [x] Google authentication
* [x] Protected routes
* [x] Logout
* [x] Account page
* [x] Current location detection
* [x] Restaurant service initialization
* [x] Restaurant Mongoose schema
* [X] Restaurant CRUD APIs
* [X] Restaurant dashboard
* [X] Food/menu management
* [X] Cart functionality
* [ ] Order service
* [ ] Order management
* [ ] Payment integration
* [ ] Delivery service
* [ ] Real-time order tracking
* [ ] Admin panel
* [ ] Notifications
* [ ] Production deployment

---

## 🔮 Future Improvements

Some planned improvements include:

* Real-time order tracking
* Online payment processing
* Restaurant dashboard
* Admin dashboard
* Order notifications
* Improved location and address management
* Scalable service communication
* Production deployment and monitoring

---

## 📌 Development Philosophy

BiteRush is being developed incrementally with a focus on:

* Clean and maintainable code
* Type safety with TypeScript
* Modular backend services
* Scalable architecture
* Secure authentication
* Separation of responsibilities
* Production-oriented development practices

---

## 👨‍💻 Author

**Aniket Patel**

BiteRush is a personal full-stack development project built to explore and implement modern web development, backend architecture, authentication, and scalable application design.
