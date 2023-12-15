import {Router} from "express";
import {controlerAluno } from "../controllers/alunoController";
export const alunoRouter = Router();

alunoRouter.post("/register", async (req, res) => {
    await controlerAluno.register(req, res);
});

alunoRouter.post("/login", async (req,res) =>{
    await controlerAluno.login(req,res);
});

alunoRouter.get("/dashboard/:token",async (req,res)=>{{
    await controlerAluno.dashboard(req,res);
}})

alunoRouter.get("/dashboard/matricula/:token", async (req,res) =>{{
    await controlerAluno.matricula(req,res);
}})

alunoRouter.get("/dashboard/matricular/:token", async(req,res)=>{{
    await controlerAluno.matricular(req,res);
}} )

alunoRouter.get("/dashboard/delete-conta/:token", async(req,res)=>{{
    await controlerAluno.apagarconta(req,res);
}})

alunoRouter.post("/esquecisenha",async(req,res)=>{
    await controlerAluno.esqueciSenha(req,res);
})

alunoRouter.post("/redefinirsenha/:token",async(req,res)=>{
    await controlerAluno.redefinirsenha(req,res);
})