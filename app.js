const express = require('express');

const app = express();

app.use(express.json());

const alunosCadastroRouter = require('./controllers/registro-alunos');
const alunosLoginRouter = require('./controllers/login-alunos');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // Permitir credenciais (se necessário)
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200); // Resposta para requisição de preflight
    } else {
      next();
    }
  });
  

app.use('/cadastro', alunosCadastroRouter);
app.use('/login',alunosLoginRouter );


app.listen(8080, () => {
    console.log("Servidor na porta 8080: http://localhost:8080");
});
