import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ActividadDto } from '../../dtos/actividad.dto';
import { ActividadesService } from '../../services/actividades.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ActividadDialogComponent } from '../actividad-dialog/actividad-dialog.component';
import { NgFor, NgIf } from '@angular/common';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { TablaBaseComponent } from '../tabla-base/tabla-base.component';
import { BaseComponent } from '../base/base.component';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserInfoDialogComponent } from '../UserInfoDialog/UserInfoDialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../../services/usuarios.service';
import { MatIconModule } from '@angular/material/icon';
/**
 * Pantalla para los usuarios con el rol de ADMINISTRADOR
 */
@Component({
  selector: 'app-actividades-admin',
  standalone: true,
  imports: [
    ActividadDialogComponent,
    ButtonModule,
    TooltipModule,
    ToastModule,
    NgIf,
    NgFor,
    RouterModule,
    TablaBaseComponent,
    TableModule,
    BaseComponent,
    InputTextModule,
    ConfirmDialogModule,
    MatIconModule
  ],
  templateUrl: './actividades-admin.component.html',
  styleUrl: './actividades-admin.component.scss',
})
export class ActividadesAdminComponent {
  actividades!: ActividadDto[];
  actividadesFiltradas!: ActividadDto[];
  dialogVisible: boolean = false;
  accion!: string;
  actividadSeleccionada!: ActividadDto | null;
  columnas!: { field: string; header: string; filter?: boolean }[];
  opcionesDeFiltro!: SelectItem[];

  constructor(
    private actividadesService: ActividadesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private usuariosService: UsuariosService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.columnas = [
      { field: 'idActividad', header: 'Id' },
      { field: 'descripcion', header: 'Descripción', filter: true },
      { field: 'prioridad', header: 'Prioridad' },
      { field: 'responsable', header: 'Responsable' },
      { field: 'estado', header: 'Estado' },
    ];

    this.opcionesDeFiltro = [
      {
        value: 'startsWith',
        label: 'Empieza con',
      },
      {
        value: 'contains',
        label: 'Contiene',
      },
    ];
    this.llenarTabla();
  }

  llenarTabla() {
    this.actividadesService.getActividades().subscribe({
      next: (res) => {
        this.actividades = this.transformarDatos(res);
        this.actividadesFiltradas = this.actividades;

      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ocurrió un error al recuperar la lista de actividades',
        });
      },
    });
  }

  transformarDatos(data: ActividadDto[]): ActividadDto[] {
    return data.map(actividad => ({
      ...actividad,
      responsable: actividad.idUsuarioActual ? actividad.idUsuarioActual.nombreUsuario : ''
    }));
  }

  nuevo() {
    this.actividadSeleccionada = null;
    this.accion = 'Crear';
    this.dialogVisible = true;
  }

  editar() {
    this.accion = 'Editar';
    this.dialogVisible = true;
  }

  eliminar() {
    if (this.actividadSeleccionada) {
      this.actividadesService.eliminar(this.actividadSeleccionada.idActividad)
        .subscribe({
          next: (res) => {
            this.llenarTabla();
            this.messageService.add({
              severity: 'success',
              summary: 'Actividad eliminada con éxito!',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Ocurrió un error al eliminar la actividad',
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Seleccione una actividad para eliminar',
      });
    }
  }

  buscar(event: Event) {
    const resultado = (event.target as HTMLInputElement).value.toLowerCase();
    this.actividadesFiltradas = this.actividades.filter(actividad =>
      actividad.descripcion && actividad.descripcion.toLowerCase().includes(resultado) ||
      actividad.prioridad && actividad.prioridad.toLowerCase().includes(resultado) ||
      actividad.estado && actividad.estado.toLowerCase().includes(resultado) ||
      actividad.idUsuarioActual?.nombreUsuario && actividad.idUsuarioActual.nombreUsuario.toString().includes(resultado)
    );
  }

  confirmarEliminacion(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de que quieres eliminar la actividad?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: "Si",
      rejectLabel: "No",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.eliminar();
      },
      reject: () => {
      }
    });
  }
  
  openUserInfo() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        // Verifica que se estén obteniendo los usuarios correctamente
        console.log('Usuarios obtenidos:', usuarios);
  
        // Filtra solo los administradores
        const administradores = usuarios.filter(usuario => usuario.rol === 'ADMINISTRADOR');
  
        // Abre el diálogo de información del usuario solo si se obtuvieron administradores
        if (administradores && administradores.length > 0) {
          // Abre el diálogo para mostrar la información de cada administrador
          administradores.forEach(administrador => {
            const dialogRef = this.dialog.open(UserInfoDialogComponent, {
              data: administrador // Pasamos cada administrador como datos al diálogo
            });
  
            // Maneja el evento después de cerrar el diálogo
            dialogRef.afterClosed().subscribe(result => {
              console.log('El diálogo de información del usuario se ha cerrado');
            });
          });
        } else {
          // Maneja el caso en que no se obtengan administradores
          console.log('No se encontraron administradores');
          this.messageService.add({
            severity: 'warn',
            summary: 'No se encontraron administradores',
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ocurrió un error al recuperar la lista de usuarios',
        });
      },
    });
  }}

