const express = require('express');
const router = express.Router();
const {encryptPWD} = require('./encriptySenha');
const { bdconfig } = require('./bdconfig');
const sql = require('mssql');






function converteDataFormato(data) {
  const partes = data.split('/');
  if (partes.length === 3) {
    return partes[2] + '-' + partes[1] + '-' + partes[0];
  }
  return null; 
}




router.post("/cadastro", async (req, res) => {
    const { nome, sobrenome, cpf, email, celular, dataNascimento, senha } = req.body;

    const senhaCriptografada = encryptPWD(senha);
    const dataNascimentoFormatada = converteDataFormato(dataNascimento);

    try {
        const pool = await sql.connect(bdconfig);
        const request = pool.request();

        // Configurando parâmetros para a execução da SP
        request.input('Id_Faixa',sql.Int,0);
        request.input('nome', sql.VarChar(50), nome);
        request.input('sobrenome', sql.VarChar(50), sobrenome);
        request.input('cpf', sql.Char(14), cpf);
        request.input('email', sql.VarChar(50), email);
        request.input('celular', sql.Char(14), celular);
        request.input('dataNascimento', sql.Date, new Date(dataNascimentoFormatada));
        request.input('senha', sql.VarChar(150), senhaCriptografada);
        
        await request.execute('Karate.spInsereAluno');
        return res.status(200).json({
            error: false,
            message: "Cadastro realizado com sucesso!",
            data: req.body
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erro ao cadastrar aluno no banco de dados",
            errorDetails: error.message
        });
    }
});

module.exports = router;