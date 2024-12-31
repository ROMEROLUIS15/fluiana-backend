import "dotenv/config";
import express from 'express';
import router from './routes';
import sequelize from './config/database';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';
import morgan from 'morgan';
import passport from './passport';
import session from 'express-session';
import path from 'path';
import { setupAssociations } from './models/associations';
import { createServer } from 'http';
import { initSocketServer } from './config/socket';
import mercadopago from 'mercadopago';
import initializeSocket from "./config/sockets";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Only in development
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Session settings for registration with Google
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration using environment variable
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? '').split(',').map(origin => origin.trim())
);
console.log("allowedOrigins: ", allowedOrigins)
//Cors configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('Request from origin:', origin);
    // Allows requests without origin (mobile apps or curl)
    if (!origin) return callback(null, true);

    if (!allowedOrigins.has(origin)) {
      const msg = `CORS policy does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(morgan('dev'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const httpServer = createServer(app);

// Initialize Socket.IO and store the instance
const io = initializeSocket(httpServer)

// Routes
app.use('/api', router);

app.use(errorHandler);

// Start server
// app.listen(PORT, '0.0.0.0', async() => {
//   console.log(`Server is running on port: ${PORT}`);
//   try {
//     await sequelize.authenticate()
//     console.log('DB CONNECTED')
//     await sequelize.sync()
//     setupAssociations();
//     console.log('Associations set up');
//   } catch (error) {
//     console.log('Unable to connect to the database:', error)
//     process.exit(1);
//   }
// });

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port: ${PORT}`);
  try {
    await sequelize.authenticate()
    console.log('DB CONNECTED')
    setupAssociations();
    await sequelize.sync();
    console.log('Associations set up and DB synchronized');
  } catch (error) {
    console.log('Unable to connect to the database:', error)
    process.exit(1);
  }
});


export { io };