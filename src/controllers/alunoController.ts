import { PrismaClient } from '@prisma/client';
import { encryptPWD ,comparePWD} from '../middlewares/encrypt';
import { converteDataFormato,converteIso8601 } from '../middlewares/converteData';
import { Request, Response } from 'express-serve-static-core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { criarToken, verificarToken,criarTokenRedefinicaoSenha } from '../middlewares/jwt';
import { enviarEmail } from '../middlewares/email';

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
          message:"Usuario não existe"
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
  ,matricula: async(req:Request, res:Response) =>{
    const {token} = req.params;
    
    if(!token){
      return res.status(500).json({
        status:500,
        message:"Erro ao obter token."
      })
    }

    const tokenDescriptografado = verificarToken(token);
    let IdAluno;
    let email;
    if(tokenDescriptografado){
      IdAluno = tokenDescriptografado.Id_Aluno;
      email = tokenDescriptografado.email;
    }
    else{
      return res.status(500).json({
        status:500,
        message:"Falha ao Descriptografar token"
      })
    }

    const matricula = await prisma.$queryRaw`select * from Karate.viewMatriculas where id_aluno = ${IdAluno}`;
    
    if (Array.isArray(matricula) && matricula.length>0) {
      const primeiroResultado = matricula[0];
    
      const nomeCompleto = primeiroResultado.nomeCompleto;
      const dataMatriculaSQL = primeiroResultado.dataMatricula;
      const ultimoPgtoSQL = primeiroResultado.ultimoPgto;
      const vencimentoParcelaSQL = primeiroResultado.VencimentoParcela;
      const matriculaAtrasada = primeiroResultado.MatriculaAtrasada;
      const ultimoPgto = converteIso8601(ultimoPgtoSQL);
      const dataMatricula = converteIso8601(dataMatriculaSQL);
      const vencimentoParcela = converteIso8601(vencimentoParcelaSQL);
      
      return res.status(200).json({
        status:200,
        message:"Aluno Matriculado",
        ultimoPgto,
        dataMatricula,
        nomeCompleto,
        matriculaAtrasada,
        vencimentoParcela,
      })
    
    }
    else{
      return res.status(400).json({
        message:"Não matriculado",
        matriculado:"Não"
      })
    }
    
  }
  ,matricular: async(req:Request, res:Response)=>{
    const {token} = req.params;
    
    if(!token){
      return res.status(500).json({
        status:500,
        message:"Erro ao obter token."
      })
    }

    const tokenDescriptografado = verificarToken(token);
    let IdAluno;
    let email;
    if(tokenDescriptografado){
      IdAluno = tokenDescriptografado.Id_Aluno;
      email = tokenDescriptografado.email;
    }
    else{
      return res.status(500).json({
        status:500,
        message:"Falha ao Descriptografar token"
      })
    }
    const hoje = new Date();
    const proximoPagamento = new Date();
    proximoPagamento.setDate(hoje.getDate() + 30);

    const dadosMatricula = {
      ultimoPgto: hoje,
      proxPgto: proximoPagamento,
      dataMatricula: hoje,
      Id_Aluno: IdAluno,
    }

    const matricula = await prisma.matricula.create({
      data:
      dadosMatricula
    })

    if(matricula){
      return res.status(200).json({
        status:200,
        message:"Matricula Realizada com Sucesso"
      })
    }
    else{
      return res.status(500).json({
        status:500,
        message:"Falha em Matricular Aluno"
      })
    }
  }
  ,apagarconta: async(req:Request,res:Response)=>{
    const {token} = req.params;

    if(!token){
      return res.status(500).json({
        status:500,
        message:"Erro ao obter token."
      })
    }

    const tokenDescriptografado = verificarToken(token);
    let IdAluno;
    let email;
    if(tokenDescriptografado){
      IdAluno = tokenDescriptografado.Id_Aluno;
      email = tokenDescriptografado.email;
    }
    else{
      return res.status(500).json({
        status:500,
        message:"Falha ao Descriptografar token"
      })
    }

    const resposta = await prisma.aluno.delete({
      where:{
        Id_Aluno:IdAluno,
      }
    })

    if(resposta){
      return res.status(200).json({
        status:200,
        message:"Conta apagada com sucesso!"
      })
    }
    else{
      return res.status(500).json({
        status:500,
        message:"Erro ao tentar deletar conta"
      })
    }
      
  }
  ,esqueciSenha: async (req:Request,res:Response) => {
    const {email} = req.body;

    if(!email){
      return res.status(500).json({
        status:500,
        message:"Por favor forneça um email."
      });
    }

    try{
      const aluno = await prisma.aluno.findFirst({
        where: {
          EMail:email,
        }
      });

      if(!aluno){
        return res.status(500).json({
          status: 500,
          message: "Usuário não encontrado para este email.",
        });
      }

      const tokenRedefinicaoSenha = criarTokenRedefinicaoSenha(email);

      const emailEnviado = await enviarEmail(email,tokenRedefinicaoSenha)

      if (emailEnviado) {
        console.log('E-mail enviado com sucesso!');
        return res.status(200).json({
          status: 200,
          message: "E-mail enviado com sucesso.",
        });
      } else {
        console.log('Houve um erro ao enviar o e-mail.');
        return res.status(500).json({
          status: 500,
          message: "Erro ao enviar o e-mail.",
        });
      }
    }
    catch(err){
      return res.status(500).json({
        status:500,
        message:"Deu erro.",
        err,
      })
    }
  }
  ,redefinirsenha: async (req:Request, res:Response)=>{
    const {token} = req.params;
    const {senha,confirmesenha} = req.body;

    if(!token){
      return res.status(500).json({
        status:500,
        message:"Falha ao receber Token"
      })
    }
    const tokenDescriptografado = verificarToken(token);

    if(!tokenDescriptografado){
      return res.status(500).json({
        status:500,
        message:"Token inválido."
      })
    }
    console.log(tokenDescriptografado);

    const email = tokenDescriptografado.email;

    const aluno = await prisma.aluno.findFirst({
      where: {
        EMail:email,
      }
    });

    if(!aluno){
      return res.status(500).json({
        status:500,
        message:"Aluno não existente."
      })
    }
    
    if(!senha||!confirmesenha){
      return res.status(500).json({
        status:500,
        message:"Insira sua nova senha e sua confirmação."
      })
    }

    if(senha != confirmesenha){
      return res.status(500).json({
        status:500,
        message:"As senhas diferem."
      })
    }

    const senhaCriptografada = encryptPWD(senha);

    try{
      const atualizasenha = await prisma.aluno.update({
        where:{
          Id_Aluno: aluno.Id_Aluno
        },
        data:{
          senha:senhaCriptografada
        }
      })

      if(!atualizasenha){
        return res.status(500).json({
          status:500,
          message:"Falha ao atualizar nova senha"
        })
      }
      else{
        return res.status(200).json({
          status:200,
          message:"Senha Atualizada com sucesso"
        })
      }
    }
    catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }
}
