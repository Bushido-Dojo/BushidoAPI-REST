const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { bdconfig } = require('./bdconfig');
const sql = require('mssql');

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await sql.connect(bdconfig); // Estabelecer a conexão com o banco de dados

    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT senha FROM Karate.Aluno WHERE email = @email');

    if (result.recordset.length > 0) {
      const senhaCriptografadaDoBanco = result.recordset[0].senha;
      
      // Comparar a senha fornecida com a senha criptografada do banco de dados
      const senhaCorreta = await bcrypt.compare(senha, senhaCriptografadaDoBanco);
      
      if (senhaCorreta) {
        // Senha válida, fazer login bem-sucedido
        res.status(200).json({ message: 'Login bem-sucedido' });
      } else {
        // Senha inválida
        res.status(401).json({ message: 'Senha incorreta' });
      }
    } else {
      // Usuário não encontrado
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao tentar fazer login:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar fazer login' });
  }
});

module.exports = router;
