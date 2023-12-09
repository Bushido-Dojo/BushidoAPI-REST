import express from 'express';
import { alunoRouter } from './routes/alunoRouter';
import { javaRouter } from './routes/javaRouter';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/api/aluno", alunoRouter);
app.use("/api/java", javaRouter);

app.listen(8080, () => console.log("Servidor online na porta 8080!!"));
