
<h1 align="center">Nexora</h1>
<p align="center">
  <strong>Premium Online Auction Platform</strong><br>
  Built to demonstrate full-stack capabilities with authentication, secure bidding, REST APIs, and real-time WebSocket communication.
</p>


---

## 🧾 Overview

**Nexora** is a full-stack online auction platform developed to showcase real-world engineering skills, including secure authentication, RESTful API design, and real-time user interaction. Built with **React**, **Node.js**, **MongoDB**, and **Socket.IO**, it simulates the backend and frontend of a modern auction system.

This project was designed as a personal portfolio project to demonstrate:
- Scalable architecture
- Authentication & authorization
- Real-time bid updates
- Secure data handling
- Clean UI/UX implementation

---

## 🚀 Key Features

- **🔐 JWT Authentication**  
  Secure user login and registration using JSON Web Tokens.

- **⚡ Real-Time Bidding (WebSockets)**  
  Bid updates pushed instantly to all connected users using `Socket.IO`.

- **🧩 RESTful API with Express.js**  
  Modular and RESTful endpoints for users and auctions.

- **📦 MongoDB with Mongoose**  
  NoSQL document database with schema validation.

- **🌐 Client-Side Routing**  
  SPA architecture powered by React Router DOM.

- **📱 Responsive & Modern UI**  
  Utility-first Tailwind CSS layout for mobile and desktop.

- **🧠 Modular Codebase**  
  Clean separation of concerns with folders for models, controllers, routes, and sockets.

---

## 🧰 Tech Stack

### Frontend
- **React.js** – Component-based UI
- **Tailwind CSS** – Utility-first styling
- **React Router DOM** – SPA routing
- **Axios** – API integration
- **Moment.js** – Date/time formatting

### Backend
- **Node.js + Express** – Server and API
- **MongoDB** – NoSQL data storage
- **Mongoose** – ODM for MongoDB
- **JWT** – User authentication
- **Socket.IO** – WebSocket-based real-time bidding
- **dotenv, bcrypt, cors** – Configuration & security

---

## 🛠️ Installation

### Prerequisites
- Node.js v16+
- MongoDB installed locally or on the cloud
- npm or yarn installed

---

### 🔧 Frontend Setup


cd client
npm install
or
yarn install

npm start
or
yarn start
Frontend runs at: http://localhost:3000



### 🔧 Backend Setup

cd server
npm install

npm start
Backend runs at: http://localhost:5000



## 🔐 Environment Variables
### Create a .env file in the /server directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexora
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

```

## 📁 Project Structure
```
nexora/
├── client/                             
│   ├── public/
│   ├── src/
│   │   ├── components/                 
│   │   ├── pages/                      
│   │   ├── utils/                      
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md

├── server/                            
│   ├── src/
│   │   ├── routes/                     
│   │   ├── models/               
│   │   ├── middlewares/               
│   │   ├── server.js/                                      
│   │   └── utils/                     
│   ├── .env                            
│   ├── server.js                       
│   ├── package.json
│   └── README.md

├── .gitignore
├── README.md
└── LICENSE
```

## 🙌 Contributing
### Contributions are welcome! Follow these steps:
```
git checkout -b feature/your-feature-name
git commit -m "✨ Add [your feature]"
git push origin feature/your-feature-name
Then open a Pull Request 🚀

```

📄 License
Distributed under the MIT License.
See LICENSE for more information.

<p align="center"> Built with ❤️ by the Nexora Team </p> ```