import { encryptPWD} from '../middlewares/encrypt';
import { Request, Response } from 'express-serve-static-core';

export const javaController ={
    criptografaSenha : async (req: Request, res:Response) =>{
        try{
            const {senha} = req.body
            const hashedPassword = encryptPWD(senha)
            return res.status(200).json({
                senhaCriptografada: hashedPassword,
            });
        }
        catch(error){
            res.status(500).json({
                status:500,
                message:"Erro ao processar dados."
            })
        }
    }
}