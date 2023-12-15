import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload{
  Id_Aluno: number;
  email: string;
}

const segredo = 'jfsc13122006';

export const criarToken = (Id_Aluno: number, email: string): string => {
  const TokenPayload: TokenPayload = { Id_Aluno, email };

  const token = jwt.sign(TokenPayload, segredo);
  return token;
};  

export const verificarToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, segredo) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return null; 
  }
};
export const criarTokenRedefinicaoSenha = (email: string): string => {
  const payload = {
    email,
    tipo: 'redefinicaoSenha',
  };

  const opcoesToken = {
    expiresIn: '1h',
  };

  const token = jwt.sign(payload, segredo, opcoesToken);
  return token;
};