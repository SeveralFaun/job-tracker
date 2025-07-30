const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

app.use('/auth', authRoutes);
app.use('/jobs', requireAuth, jobRoutes);

app.get('/', (req, res) => {
  res.send('Job tracker API is running!');
});

mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.listen(3000, () => console.log('Server started on port 3000')); 