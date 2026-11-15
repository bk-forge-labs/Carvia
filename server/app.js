require('dotenv').config(); // Adding .env
const express = require('express'); // creates the server
const cookieParser = require('cookie-parser');
const cors = require('cors');
// Adding MongoDB connection
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {deploymentConfig} = require('./config/deployment');
const {uploadDir, ensureUploadDir} = require('./config/storage');
const {origins} = deploymentConfig();
ensureUploadDir();

const app = express();
// Production API has no host port and is reached through one Caddy proxy.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const PORT = process.env.PORT || 5050; // Enabling .env variables

app.use(require('helmet')({crossOriginResourcePolicy: {policy: 'cross-origin'}}));
app.use(express.json());

app.use('/uploads', express.static(uploadDir));
app.use(cookieParser());
app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);
const databaseReady = connectDB();
// Middleware

// Routes

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dealers', require('./routes/dealerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/cars', require('./routes/carPublicRoutes'));
app.use('/api/dealer/cars', require('./routes/carDealerRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/workspace', require('./routes/workspaceRoutes'));

//Test route
app.get('/', (req, res) => {
  res.send('Car Platform API is running');
});

/*debugging*/
app.get('/api/live', (req, res) => res.json({ ok: true, service: 'api' }));
app.get('/api/health', async (req, res) => {
  const connection = require('mongoose').connection;
  try {
    if (connection.readyState !== 1) throw new Error('Database unavailable');
    await Promise.race([
      connection.db.command({ ping: 1 }, { timeoutMS: 2000 }),
      new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Database timeout')), 2500); timer.unref(); })
    ]);
    return res.json({ ok: true, service: 'api' });
  } catch { return res.status(503).json({ ok: false, service: 'api' }); }
});
app.use(notFound);
app.use(errorHandler);

// Starting the server
databaseReady.then(async () => {
  await Promise.all([require('./models/Enquiry').init(), require('./models/AccountToken').init(), require('./models/Appointment').init(), require('./models/FollowUpTask').init(), require('./models/WorkspaceMessage').init()]);
  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  });
});
