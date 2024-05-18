import { IsNotEmpty, IsString } from "class-validator"


export class LoginDto{
    
    @IsString()
    @IsNotEmpty()
    nombreUsuario: string
    
    @IsNotEmpty()
    clave: string
}