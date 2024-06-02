import { Component, ViewChild } from '@angular/core';
//import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Table, TableModule } from 'primeng/table';
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
import { AuditoriaActividadDto } from '../../dtos/auditoria-actividades.dto';
import { AuditoriaActividadesService } from '../../services/auditoriaactividades.services';
import { RolesEnum } from '../../enums/roles.enum';
import { EstadosActividadEnum } from '../../enums/estados-actividad.enum';
import { EditActividadDto } from '../../dtos/edit-actividad.dto';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosService } from '../../services/usuarios.service';
import { MatDialog } from '@angular/material/dialog';
import { UserInfoDialogComponent } from '../UserInfoDialog/UserInfoDialog.component';


/**
 * Pantalla para los usuarios con el rol de EJECUTOR
 */
@Component({
  selector: 'app-actividades-ejecutor',
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
    ConfirmDialogModule,
    MatIconModule
  ],
  templateUrl: './actividades-ejecutor.component.html',
  styleUrl: './actividades-ejecutor.component.scss',
})
export class ActividadesEjecutorComponent {
  actividades!: ActividadDto[];
  auditoriaActividades!: AuditoriaActividadDto[];
  dialogVisible: boolean = false;
  accion!: string;
  actividadSeleccionada!: ActividadDto | null;
  columnas!: { field: string; header: string; filter?: boolean }[];
  opcionesDeFiltro!: SelectItem[];

  constructor(
    private actividadesService: ActividadesService,
    private auditoriaactividadesService: AuditoriaActividadesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private usuariosService: UsuariosService,
    private dialog: MatDialog

  ngOnInit() {
    this.columnas = [
      { field: 'idActividad', header: 'Id' },
      { field: 'descripcion', header: 'Descripción', filter: true },
      { field: 'prioridad', header: 'Prioridad' },
      //{ field: 'responsable', header: 'Responsable' },
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
        console.log(res);
        this.actividades = this.transformarDatos(res);
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

  finalizar() {
    if (this.actividadSeleccionada) {
      this.actividadSeleccionada.estado = EstadosActividadEnum.FINALIZADO;
      const editActividadDto: EditActividadDto = {
        idActividad: this.actividadSeleccionada.idActividad,
        descripcion: this.actividadSeleccionada.descripcion || '', // Asignar cadena vacía si es null
        idUsuarioActual: this.actividadSeleccionada.idUsuarioActual ? this.actividadSeleccionada.idUsuarioActual.idUsuario : null, // Asignar el id del usuario o null
        prioridad: this.actividadSeleccionada.prioridad,
        estado: this.actividadSeleccionada.estado
    };
            
      this.actividadesService.editar(editActividadDto)
        .subscribe({
          next: (res) => {
            this.llenarTabla();
            this.messageService.add({
              severity: 'success',
              summary: 'Actividad modificada con éxito!',
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

  confirmarFinalizar(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de que quieres finalizar la actividad?',
      header: 'Confirmar finalización',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: "Si",
      rejectLabel: "No",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.finalizar();
      },
      reject: () => {
      }
    });
  }
  ejecutor() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        // Verifica que se estén obteniendo los usuarios correctamente
        console.log('Usuarios obtenidos:', usuarios);
  
        // Filtra solo los ejecutores
        const ejecutores = usuarios.filter(usuario => usuario.rol === 'EJECUTOR');
  
        // Abre el diálogo de información del usuario solo si se obtuvieron ejecutores
        if (ejecutores && ejecutores.length > 0) {
          // Abre el diálogo para mostrar la información de cada ejecutor
          ejecutores.forEach(ejecutor => {
            const dialogRef = this.dialog.open(UserInfoDialogComponent, {
              data: ejecutor // Pasamos cada ejecutor como datos al diálogo
            });
  
            // Maneja el evento después de cerrar el diálogo
            dialogRef.afterClosed().subscribe(result => {
              console.log('El diálogo de información del usuario se ha cerrado');
            });
          });
        } else {
          // Maneja el caso en que no se obtengan ejecutores
          console.log('No se encontraron ejecutores');
          this.messageService.add({
            severity: 'warn',
            summary: 'No se encontraron ejecutores',
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
  }
}
