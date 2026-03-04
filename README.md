# KiranaKart - Grocery Management System
## IntelliJ IDEA Setup Guide

```
KiranaKart/
├── backend/                         <-- Open THIS folder in IntelliJ
│   ├── pom.xml                      <-- Maven project file (auto-detected)
│   ├── mvnw                         <-- Maven wrapper (no Maven install needed)
│   └── src/
│       ├── main/java/com/kiranakart/
│       │   ├── KiranaKartApplication.java   <-- MAIN CLASS (run this)
│       │   ├── config/              SecurityConfig, DataInitializer
│       │   ├── controller/          ProductController, OrderController,
│       │   │                        AuthController, UserController, AIController
│       │   ├── model/               Product, Order, OrderItem, User
│       │   ├── repository/          JPA repositories (4 files)
│       │   ├── security/            JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│       │   └── service/             ProductService, OrderService, AuthService,
│       │                            UserService, ClaudeAIService
│       └── resources/
│           └── application.properties   <-- ADD YOUR API KEY HERE
└── frontend/                        <-- Run separately with npm start
    ├── package.json
    └── src/pages/                   Dashboard, POS, Products, Reports, AI, Users
```

---

## STEP 1 - Install Prerequisites

| Tool        | Version | Download |
|-------------|---------|----------|
| IntelliJ    | 2023+   | https://www.jetbrains.com/idea/ (Community is FREE) |
| Java JDK 17 | 17      | https://adoptium.net/temurin/releases/?version=17 |
| Node.js     | 18+     | https://nodejs.org |

Verify installs:
  java -version   (should show 17.x)
  node -v         (should show 18.x+)

---

## STEP 2 - Open Backend in IntelliJ

1. Open IntelliJ IDEA
2. Click  File > Open
3. Browse to the  backend/  folder inside this project
4. Select the backend folder, click Open
5. IntelliJ shows "Trust and Open Maven Project?" -> click Trust Project
6. Wait for Maven to download dependencies (2-3 min, needs internet)

---

## STEP 3 - Set Java 17 SDK

1. File > Project Structure  (Ctrl+Alt+Shift+S)
2. Project > SDK > select Java 17
3. If Java 17 missing: Add SDK > Download JDK > select Temurin 17
4. Click Apply, OK

---

## STEP 4 - Add Your Claude API Key

Open in IntelliJ:  src/main/resources/application.properties

Find this line:
  claude.api.key=YOUR_CLAUDE_API_KEY_HERE

Replace with your real key from:  https://console.anthropic.com > API Keys

---

## STEP 5 - Run the Backend

Option A (easiest):
  Open KiranaKartApplication.java
  Click the green play button next to  public static void main
  OR right-click the file > Run KiranaKartApplication

Option B (terminal inside IntelliJ):
  cd backend
  ./mvnw spring-boot:run          (Mac/Linux)
  mvnw.cmd spring-boot:run        (Windows)

Option C (Maven panel in IntelliJ):
  Right panel > Maven > kiranakart-backend > Plugins > spring-boot > spring-boot:run

Backend is ready when you see in the console:
  Started KiranaKartApplication on port 8080
  Default users created:
    ADMIN   -> admin / Admin@123
    CASHIER -> cashier / Cashier@123
  Sample grocery data initialized! (30 products)

URLs:
  API:        http://localhost:8080
  H2 Console: http://localhost:8080/h2-console
              JDBC URL: jdbc:h2:mem:kiranakartdb

---

## STEP 6 - Run the Frontend

Open a NEW terminal (keep backend running in IntelliJ):

  cd frontend
  npm install
  npm start

Browser opens automatically at:  http://localhost:3000

---

## Login Credentials

  Admin:   username=admin    password=Admin@123   (full access)
  Cashier: username=cashier  password=Cashier@123  (POS only)

---

## API Reference (for Postman testing)

  POST /api/auth/login                  Login, returns JWT token
  GET  /api/products                    List all 30 products
  POST /api/products                    Create product (Admin)
  PUT  /api/products/{id}               Update product (Admin)
  DELETE /api/products/{id}             Delete product (Admin)
  GET  /api/products/{id}/ai-price-suggestion   Claude AI pricing
  POST /api/orders                      Create order (POS checkout)
  GET  /api/orders/dashboard/stats      Revenue + order counts
  GET  /api/orders/reports/top-products Top selling items
  GET  /api/orders/reports/daily-revenue  Daily revenue chart data
  GET  /api/orders/reports/by-category  Sales by category
  POST /api/ai/chat                     Chat with Claude AI

For protected endpoints, add header:
  Authorization: Bearer <token from login>

---

## Troubleshooting

"Port 8080 already in use"
  Windows:  netstat -ano | findstr :8080  then  taskkill /PID <PID> /F
  Mac/Linux: lsof -ti:8080 | xargs kill

"Cannot find symbol" errors
  File > Invalidate Caches > Invalidate and Restart

Maven dependencies not loading
  Right-click pom.xml > Maven > Reload Project

"npm install" fails
  Make sure Node.js 18+ is installed: node -v

Frontend can not reach backend
  Make sure backend is running first (port 8080)
  Check CORS: backend allows http://localhost:3000

---

## Tech Stack

  Backend:  Spring Boot 3.2, Spring Security, JWT, JPA, H2, Lombok
  AI:       Claude API (Anthropic)
  Frontend: React 18, Axios, Recharts, Lucide icons
  Database: H2 in-memory (auto-creates on startup, pre-loaded with 30 products)
