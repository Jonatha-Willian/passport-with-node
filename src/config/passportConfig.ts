import passport from "passport";
import doteenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { Strategy as JWTStrategy, ExtractJwt} from "passport-jwt";
import jwt from "jsonwebtoken";
import { User, UserInstance } from "../models/User";

doteenv.config();

const notAuthorizedJson = { status: 401, message: "Not authorized" };
const options = {
    //Onde o token vai ser encontrado
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //Chave secreta para validar o token
    secretOrKey: process.env.JWT_SECRET as string
};

//options é o objeto de configuração do JWTStrategy
//payload é o conteúdo do token, ou seja, os dados do usuário
//done é a função de callback que deve ser chamada quando a autenticação for concluída
passport.use(new JWTStrategy(options, async (payload, done) => {
    const user = await User.findByPk(payload.id);
    if(user) {
        return done(null, user);
    } else {
        return done(notAuthorizedJson, false);
    }
}));

export const generateToken = (data: object) => {
    return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn: '30d' });
}


export const privateRoute = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", (err: Error | null, user: UserInstance | false) => {
        req.user = user;
        return user ? next() : next(notAuthorizedJson);    
    })(req, res, next);
}


export default passport;