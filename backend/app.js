
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js'
import goalRoutes from './src/routes/goalRoutes.js'
import resourceRoutes from './src/routes/resourceRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import utilityRoutes from './src/routes/utilityRoutes.js';


const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'DevTrack API is running' });
});

//auth
app.use('/api/auth',authRoutes);

//goal
app.use('/api/goals',goalRoutes);

//resource
app.use('/api/resource',resourceRoutes);

//progress 
app.use('/api/progress',progressRoutes);

//fetching title from url
app.use('/api/utility', utilityRoutes);

export default app;