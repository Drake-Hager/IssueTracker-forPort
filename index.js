import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import debug from 'debug';
import { authMiddleware } from '@merlin4/express-auth';
import cookieParser from 'cookie-parser';
const debugServer = debug('app:Server');
import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bug.js';
import { commentRouter } from './routes/api/comments.js';
import { testCasesRouter } from './routes/api/testCases.js';
import { fileURLToPath } from 'url';
import cors from 'cors'
import path from 'path';
const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}

//These two lines are required 
app.use(express.urlencoded({ extended: true}));
app.use(express.json())
app.use(cookieParser());

app.use(cors(corsOptions))

app.use(authMiddleware(process.env.JWT_SECRET, 'authToken', {httpOnly:true, maxAge: 1000*60*60}))
app.use('/api/users', userRouter)
app.use('/api/bugs', bugRouter)
app.use('/api/bugs', commentRouter);
app.use('/api/bugs', testCasesRouter);
app.use(express.static('Frontend/dist'));
const port = process.env.PORT || 8080;


app.listen(port, () =>{
  debugServer(`Server is now running on port http://localhost:${port}`);
})
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)

app.get('*', (req, res) =>{
  res.sendFile(path.resolve(_dirname, 'Frontend', 'dist', 'index.html'))
})

app.get('/api', (req, res) => {
  res.send('Hello world from backend.');
});