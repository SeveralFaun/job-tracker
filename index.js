const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables');
  process.exit(1);
}

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: 'lax' } });

const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/auth', csrfProtection, authRoutes);
app.use('/jobs', requireAuth, csrfProtection, jobRoutes);

app.get('/', (req, res) => {
  res.send('Job tracker API is running!');
});

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 