🚀 LiveTrack: Real-Time Synchronization & Safety Platform
Next.jsSocket.ioTailwind CSSLicense: ISC

LiveTrack is a high-performance, real-time location synchronization platform designed for safety, group coordination, and social interaction. Built with a "Performance-First" mindset, it offers sub-second latency for tracking movements across the globe.

✨ Key Features
🌐 Real-Time Synchronization
Sub-second Location Updates: Powered by WebSockets (Socket.io) for fluid marker movements.
Connection Recovery: Robust state restoration for users with intermittent network signals.
Predictive Telemetry: Intelligent velocity calculation and activity detection (Walking 🚶, Driving 🚗, Stationary 🏠).
🚨 Safety Intelligence
Persistent SOS: Server-backed emergency signals that remain active even if the browser is refreshed or closed.
Proximity Alerts: Automatic "Toast" notifications when group members are within 100 meters.
Emergency Helplines: Integrated one-tap access to critical emergency contacts.
🗺️ Collaborative Mapping
Instant Meeting Points: Double-click anywhere to drop a "Waypoint" synced across the entire party.
Party System: Secure, code-based rooms for instant group tracking without complex sign-ups.
Host Controls: Creators have the authority to moderate members and manage the map state.
🎨 Premium User Experience
Glassmorphic UI: Modern design built with Tailwind CSS 4 and Radix UI.
Fluid Animations: High-end transitions powered by Framer Motion, GSAP, and a subtle Three.js integration for visual depth.
🛠️ Technical Stack
Frontend: Next.js 16, React 19, Tailwind CSS 4, Lucide Icons
Mapping: Leaflet.js, OpenStreetMap
Animation: Framer Motion, GSAP, Three.js
Backend: Node.js, Express.js, Socket.io
State Management: Custom Server-side PartyManager logic
🚀 Getting Started
Prerequisites
Node.js (v18+)
npm or yarn
Installation
Clone the repository:

git clone https://github.com/SiddharthChaturvedii/Real-Time-Tracker.git
cd Real-Time-Tracker
Setup Backend:

npm install
# Start the server (runs on port 3000)
node app.js
Setup Frontend:

cd frontend
npm install
# Run development server
npm run dev
Environment Variables: Create a 

.env.local
 in the frontend directory:

NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
📂 Project Structure
├── app.js               # Express server & Socket.io logic
├── managers/            # Server-side state (PartyManager)
├── utils/               # Server validators & loggers
└── frontend/            # Next.js Application
    ├── app/             # Application routes & layout
    ├── components/      # UI & Mapping components
    └── lib/             # API & Socket client utilities
🗺️ Future Roadmap
 Historical path tracking (breadcrumbs)
 Geofencing notifications
 End-to-end encryption for location data
 Offline map support
🤝 Contributing
Contributions are welcome! If you have a feature request or bug report, please open an issue or submit a pull request.

📜 License
This project is licensed under the 

ISC License
.

Built with ❤️ for a safer, more connected world.
