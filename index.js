const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const Job = require('./models/Job');

const cookieParser = require('cookie-parser');
const csrf = require('csurf');

app.use(express.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const requireAuth = require('./middleware/requireAuth');

//app.use('/jobs', requireAuth, require('./routes/jobs'));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));




app.get('/', (req, res) => {
  res.send('Job tracker API is running!');
});

const jobRoutes = require('./routes/jobs');
app.use('/jobs', requireAuth, jobRoutes);


app.listen(3000, () => console.log('Server started on port 3000')); 