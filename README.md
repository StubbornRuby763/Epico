# NexusStore Documentation

## Architecture Overview

NexusStore is a modular e-commerce platform that demonstrates the implementation of secure payment processing through OAuth2 authentication and Prisma ORM for database management. The system simulates a microservices architecture where a **Store** communicates with a **Bank** service to process payments securely.

---

**Microservices with OAuth2** provide:
- Realistic security simulation
- Independent scalability  
- Fault isolation
- Clean separation of business domains

**Prisma ORM with TypeScript** provides:
- End-to-end type safety
- Reduced boilerplate code
- Automatic migration management
- Intelligent IDE support
- Faster development cycles

The combination creates a robust, maintainable, and secure e-commerce platform that demonstrates production-ready patterns while maintaining developer productivity.

---

## Structure
``` Markdown
src/
├── Store/
│   └── Managers/
│       └── ProductManager.ts
├── Bank/
│   ├── BankApi.ts
│   ├── Routes.ts
│   └── Server.ts
├── Services/
│   ├── BankService.ts
│   └── ProductService.ts
└── index.ts
```

Para que cualquiera que descargue tu proyecto pueda ejecutarlo, lo ideal es poner las instrucciones en una sección llamada **Prerequisites** (Requisitos previos) en tu `README.md`.

Aquí tienes cómo redactarlo de forma clara y técnica:

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
