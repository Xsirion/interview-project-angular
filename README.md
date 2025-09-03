# Real-time Stock Trading Table - Angular Application for interview

A responsive Angular application displaying real-time stock market data using **SignalR WebSocket communication**.

## Features

- Real-time stock price updates
- Responsive data table with sorting
- Connection status monitoring
- Custom pipes for price and percentage formatting
- State management with @ngrx/signals

## Tech Stack

- **Angular 20** – Frontend framework  
- **SignalR** – Real-time WebSocket communication  
- **@ngrx/signals** – Application state management  
- **RxJS** – Reactive programming  
- **Tailwind CSS** – Styling and responsiveness  
- **Vitest + @testing-library/angular** – Unit and integration testing  

## Requirements to run project

- Node.js **18+**  
- npm **8+**  
- Docker (for backend)  

## Installation & Setup

### 1. Backend (SignalR Hub)

```bash
# Pull and run the SignalR backend
docker pull kubamichalek/statscore-websocket-recruitment
docker run -p 32770:8080 --rm kubamichalek/statscore-websocket-recruitment
```

Backend available at http://localhost:32770

### 2. Frontend
```bash
# Clone repository
git clone git@github.com:Xsirion/interview-project-angular.git
cd interview-project-angular

# Install dependencies
npm install or npm i

# Start development server
npm start
```
App available at → http://localhost:4200


 ## Available Scripts

### Development
npm start              # ng serve
npm run build          # ng build

### Testing
npm test               # vitest (interactive)
npm run test:run       # vitest run (CI)
npm run test:ui        # Vitest UI dashboard

### Code Quality
npm run lint           # ESLint
npm run format         # format code by Prettier
npm run lint:fix       # Auto-fix ESLint issues
npm run format:check   # Check code formatting