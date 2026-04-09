import express from 'express';
import cors from 'cors';
import simulationRoutes from './routes/simulationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/simulation', simulationRoutes);

app.get('/', (req, res) => {
  res.send('Anti-Gravity Backend API running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
