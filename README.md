# NexusStore && Pixel Bank Documentation

## Architecture Overview

NexusStore and Pixel Bank operate under a microservices-based architecture, designed to simulate a real-world e-commerce and banking workflow.
Core Components

Pixel Bank: A simplified banking simulator that acts as the financial backend. It handles transaction validation and account management.

NexusStore: A modular e-commerce platform built to demonstrate secure payment processing. It utilizes Prisma ORM for efficient database management and high-performance data handling.

## Key Features & Security

**OAuth2 Authentication**: The system implements secure authorization flows, ensuring that sensitive customer data is never directly exposed during the payment process.

**Simulated Microservices**: The architecture focuses on the communication between the Store (Service A) and the Bank (Service B), simulating an API-driven transaction environment.

**Database Integrity**: Using Prisma, the system maintains a structured and type-safe schema for products, users, and transaction logs.


---

## Prerequisites

To run this project, you need to have **Node.js** and the **TypeScript** compiler installed globally.

### 1. Node.js (v25.9.0+)
**Descarga:** [nodejs.org](https://nodejs.org/)

### 2. TypeScript (v5.9.3+)
Even though the project includes TypeScript as a development dependency, it is recommended to install it globally to use the `tsc` command directly
**Instalation:**
```bash
npm install -g typescript
```

---


## Setup and Use

```bash
git clone https://github.com/StubbornRuby763/Epico
cd Epico

npm install

npm run db:migrate

#to dev
npm run dev

# To poduction
npm run build
npm run start
```
