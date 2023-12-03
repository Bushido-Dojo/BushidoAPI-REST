// const {bdconfig}=require('./bdconfig')
// const sql = require('mssql');

// executeProcedure(`EXEC Karate.spInsereAluno @id_Faixa = 0, @nome = nome, @sobrenome = sobrenome, @cpf = cpf, @email = email, @celular =
//         celular, @dataNascimento = dataNascimento, @senha = senhaCriptografada`, params);
const {encryptPWD} = require('./encriptySenha');

const senha = "paralelepipedo"

console.log(encryptPWD(senha));