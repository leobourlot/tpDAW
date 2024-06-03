import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from 'primeng/api';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.services";
import { RolesEnum } from "../../enums/roles.enum";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from "@angular/common";
import { ToastModule } from "primeng/toast";

@Component({
    standalone:true,
    templateUrl:'../login/login.component.html',
    styleUrl:'../login/login.component.scss',
    selector:'app-login',
    imports:[ReactiveFormsModule,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        ToastModule],
})
export class LoginComponent{

    form = new FormGroup({
        nombreUsuario:  new FormControl('',[Validators.required]),
        clave: new FormControl('',[Validators.required])
    });

    constructor(private messageService:MessageService, private router:Router, private authService:AuthService){}

    ngOninit(){}

    login(){
        if(!this.form.valid){
            this.form.markAllAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Debe ingresar todos los campos'
            });
            return;
        }
        const formValue = this.form.getRawValue();
        console.log(formValue);
        this.authService
        .login(formValue.nombreUsuario!, formValue.clave!)
        .subscribe({
            next: (res) =>{
                this.authService.setSession(res.token);
                if(this.authService.hasRole(RolesEnum.ADMINISTRADOR)){
                    this.router.navigateByUrl('admin');
                } else if (this.authService.hasRole(RolesEnum.EJECUTOR)) {
                    this.router.navigateByUrl('ejecutor');
                }else{
                    this.router.navigateByUrl('');
                }
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al autenticar. Verifique el usuario y la contraseña',
                });
            },
        });
    }
}