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