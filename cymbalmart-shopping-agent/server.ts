import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRouter);

// Serve static assets from build
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PartyCraft server running on port ${PORT}`);
});
