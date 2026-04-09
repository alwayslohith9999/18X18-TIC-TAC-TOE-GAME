import express from 'express';
import { runSimulation, configureSimulation, getResults } from '../controllers/simulationController.js';

const router = express.Router();

router.get('/run', runSimulation);
router.post('/config', configureSimulation);
router.get('/results', getResults);

export default router;
