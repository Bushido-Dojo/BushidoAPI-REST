import {javaController} from '../controllers/javaController'
import { Router } from 'express';
export const javaRouter = Router();

javaRouter.post('/criptografa-senha',async (req,res) =>{
    await javaController.criptografaSenha(req,res);
})

