export const runSimulation = (req, res) => {
  // Placeholder for running the simulation stream
  res.json({
    status: 'running',
    message: 'Simulation run initiated',
    dataStreamUrl: '/stream'
  });
};

export const configureSimulation = (req, res) => {
  const config = req.body;
  // Placeholder for storing configuration
  console.log('Received Simulation Config:', config);
  res.json({
    status: 'success',
    message: 'Simulation configured',
    configReceived: config
  });
};

export const getResults = (req, res) => {
  // Placeholder for historical results
  res.json({
    status: 'success',
    data: {
      averageForce: 9.81,
      maxInversionArea: 5.2,
      vacuumEnergyPeak: 12.4
    }
  });
};
