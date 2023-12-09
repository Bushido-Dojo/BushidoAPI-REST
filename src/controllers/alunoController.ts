import { PrismaClient } from '@prisma/client';
import { encryptPWD ,comparePWD} from '../middlewares/encrypt';
import { converteDataFormato } from '../middlewares/converteData';
import { Request, Response } from 'express-serve-static-core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { criarToken, verificarToken } from '../middlewares/jwt';

const prisma = new PrismaClient();

export const controlerAluno = {
  register: async (req: Request, res: Response) => {
    const { nome, sobrenome, cpf, email, celular, dataNascimento, senha } = req.body;

    if (!nome || !sobrenome || !cpf || !email || !celular || !dataNascimento || !senha) {
      const verificador = {
        nome: nome || null,
        sobrenome: sobrenome || null,
        cpf: cpf || null,
        email: email || null,
        celular: celular || null,
        dataNascimento: dataNascimento || null,
        senha: senha || null,
      };

      return res.status(500).json({
        status: 500,
        message:{
          message:"Falha ao receber parametros."
        },
        verificador
      });
    }

    try {
      const emailExistente = await prisma.aluno.findFirst({
        where: {
          EMail: email
        }
      });

      const cpfExistente = await prisma.aluno.findFirst({
        where: {
          CPF: cpf,
        },
      });

      const celularExistente = await prisma.aluno.findFirst({
        where: {
          Celular: celular,
        },
      });

      if(senha.length<4){
        return res.status(500).json({
            status:500,
            message:{
              message:"senha precisa ter pelo menos 4 digitos."
            },
        })
      }

      if (emailExistente || cpfExistente || celularExistente) {
        return res.status(500).json({
          status: 500,
          message:{
            message: emailExistente ? "E-mail já cadastrado" : (cpfExistente ? "CPF já cadastrado" : "Celular já cadastrado"),
          }
        });
      }

      const senhaCriptografada = encryptPWD(senha);
      const dataNascimentoFormatada = converteDataFormato(dataNascimento);

      if(!dataNascimentoFormatada){
        return res.status(500).json({
          status:500,
          message:{ 
            message:"Data de Nascimento inválida."
          }
        })
      }
      const aluno = await prisma.$queryRaw`EXEC Karate.spInsereAluno 0,${nome},${sobrenome},${cpf},${email},${celular},${dataNascimentoFormatada},${senhaCriptografada}`;
      return res.status(200).json({
        status:200,
        message:"Cadastro Realizado com Sucesso!",
      })


    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        const prismaError = error as PrismaClientKnownRequestError;
        return res.status(500).json({
          status:500,
          message: prismaError.meta || 'Erro desconhecido'
        })
      }
      else{
        return res.status(500).json({
          status: 500,
          message: 'Erro ao buscar o aluno.',
          erro: error
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }


  ,login: async (req: Request, res:Response) =>{
    const {email,senha} = req.body;

    if(!email||!senha){
        const validator = {
            email:email ||null,
            senha:senha|| null,
        }

        return res.status(500).json({
            status:500,
            message:"É necessario o email e a senha para realizar o login",
            validator,
        })
    }

    try{
      const aluno = await prisma.aluno.findFirst({
        where:{
          EMail:email,
        },
        select:{
          senha: true,
          Id_Aluno: true,
        }
      });

      if(!aluno){
        return res.status(500).json({
          status:500,
          message:"Usuario não encontrado"
        });
      }
      const senhaCorreta = await comparePWD(senha,aluno.senha)


      if(!senhaCorreta){
        return res.status(500).json({
          status:500,
          message:"Senha Inválida."
        })
      }

      if(senhaCorreta){

        return res.status(200).json({
          status:200,
          message:"Login realizado com sucesso!",
          token: criarToken(aluno.Id_Aluno,email),
        })
      }
    }
    catch(error){
      return res.status(500).json({
        status:500,
        message:"Erro ao tentar fazer login",
        erro: error
      })
    }
  }

  ,dashboard: async(req:Request, res:Response) =>{
    const {token} = req.params;

    if(!token){
      return res.status(500).json({
        status:500,
        message:"Erro ao obter token."
      })
    }

    const tokenDescriptografado = verificarToken(token)

    if(tokenDescriptografado){
      const Id_Aluno = tokenDescriptografado.Id_Aluno;
      const email = tokenDescriptografado.email;
      
      const alunoLogado = await prisma.aluno.findFirst({
        where:{
          EMail:email,
          Id_Aluno:Id_Aluno
        },
        select:{
          Nome:true,
          Sobrenome:true,
          Id_Faixa:true,
          Matricula: { 
            select: {
              Id_Aluno: true
            }
          }
        }
      });

      if(alunoLogado){

        let matriculado = ''
        if(alunoLogado.Matricula && alunoLogado.Matricula.length > 0){
          matriculado = "Sim"
        }
        else{
          matriculado = "Não"
        }
        console.log(matriculado)

        return res.status(200).json({
          status:200,
          aluno:alunoLogado,
          matriculado: matriculado
        })
      }

      else{
        return res.status(500).json({
          status:500,
          message:"Deu errado",
        })
      }
    }

  }

};
