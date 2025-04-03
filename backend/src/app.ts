import express from 'express';
import cors from 'cors';
import { editorialController } from './controllers/editorial.controller';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/editorials', editorialController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;

