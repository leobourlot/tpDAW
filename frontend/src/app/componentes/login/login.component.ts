import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from 'primeng/api';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.services";
import { RolesEnum } from "../../enums/roles.enum";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Importar el módulo de iconos
import { CommonModule } from "@angular/common";
import { ToastModule } from 'primeng/toast';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule, // Agregar el módulo de iconos
        ToastModule,
        MatDialogModule
    ],
})
export class LoginComponent implements OnInit {
    form = new FormGroup({
        nombreUsuario: new FormControl('', [Validators.required]),
        clave: new FormControl('', [Validators.required])
    });

    constructor(
        private messageService: MessageService,
        private router: Router,
        private authService: AuthService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {}

    login() {
        if (!this.form.valid) {
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
                next: (res) => {
                    this.authService.setSession(res.token);
                    let role: string;
                    if (this.authService.hasRole(RolesEnum.ADMINISTRADOR)) {
                        role = 'Administrador';
                        this.router.navigateByUrl('admin');
                    } else if (this.authService.hasRole(RolesEnum.EJECUTOR)) {
                        role = 'Ejecutor';
                        this.router.navigateByUrl('ejecutor');
                    } else {
                        role = 'Usuario';
                        this.router.navigateByUrl('');
                    }
                    this.showWelcomeModal(formValue.nombreUsuario!, 'example@example.com', role); // Pasa la información del usuario
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al autenticar. Verifique el usuario y la contraseña',
                    });
                },
            });
    }

    showWelcomeModal(nombreUsuario: string, email: string, role: string, ) {
        const dialogRef = this.dialog.open(WelcomeDialog, {
            data: { nombreUsuario, email, role }
        });

    }
}

@Component({
    selector: 'welcome-dialog',
    template: `
    <div class="dialog-header">
        <h1>Bienvenido</h1>
    </div>
    <div class="dialog-content">
        <p><strong>Nombre de Usuario:</strong> {{ data.nombreUsuario }}</p>
        <p><strong>Rol:</strong> {{ data.role }}</p>
    </div>
    <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()" class="ok-button">OK</button>
    </div>
    `,
    styles: [`
        .dialog-header {
            background-color: #3f51b5;
            color: white;
            padding: 16px;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }
        .dialog-content {
            padding: 24px;
            font-size: 16px;
        }
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            padding: 8px;
        }
        .ok-button {
            background-color: #3f51b5;
            color: white;
            margin: 8px;
        }
        .ok-button:hover {
            background-color: #303f9f;
        }
    `]
})
export class WelcomeDialog {
  constructor(
    public dialogRef: MatDialogRef<WelcomeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      
      nombreUsuario: string;
      role: string;
    }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}