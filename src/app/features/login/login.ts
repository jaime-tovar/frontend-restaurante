import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import { AuditContextService } from '../../core/audit-context.service';

import { AuthService } from '../../core/services/auth.service';

import { UsuarioService } from '../../core/services/usuario.service';

import {
  LoginResponse,
} from '../../models/api.models';

@Component({
  selector: 'app-login',

  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],

  templateUrl: './login.html',

  styleUrl: './login.scss',
})

export class LoginComponent
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly usuarioService =
    inject(UsuarioService);

  private readonly audit =
    inject(AuditContextService);

  private readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly snack =
    inject(MatSnackBar);

  readonly loading =
    signal(false);

  // TRUE = existen usuarios
  readonly existeUsuario =
    signal(true);

  readonly loginForm =
    this.fb.nonNullable.group({

      username: [
        '',
        Validators.required,
      ],

      password: [
        '',
        Validators.required,
      ],
    });

  readonly firstUserForm =
    this.fb.nonNullable.group({

      nombre_completo: [
        '',
        Validators.required,
      ],

      username: [
        '',
        Validators.required,
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
        ],
      ],

      rol: [
        'admin',
        Validators.required,
      ],

      telefono: [''],
    });

  ngOnInit(): void {

    this.loading.set(true);

    this.usuarioService
      .existeUsuario()
      .subscribe({

        next: (
          existe: boolean
        ) => {

          this.existeUsuario.set(
            existe
          );

          this.loading.set(false);
        },

        error: () => {

          this.loading.set(false);

          // Si falla, asumimos que sí existen
          this.existeUsuario.set(true);
        },
      });
  }

  ingresar(): void {

    if (
      this.loginForm.invalid
    ) {

      this.loginForm
        .markAllAsTouched();

      return;
    }

    const {
      username,
      password,
    } =
      this.loginForm
        .getRawValue();

    this.loading.set(true);

    this.usuarioService
      .login(
        username,
        password
      )

      .subscribe({

        next: (
          response: LoginResponse
        ) => {

          this.loading.set(false);

          // Guardar JWT
          this.auth.login(
            response.data.access_token
          );

          // Guardar usuario actual
          this.audit.select(
            response.data.id_usuario
          );

          void this.router
            .navigateByUrl('/app');
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.loading.set(false);

          this.snack.open(
            this.msg(err),
            'Cerrar',
            {
              duration: 5000,
            }
          );
        },
      });
  }

  crearPrimero(): void {

    if (
      this.firstUserForm.invalid
    ) {

      this.firstUserForm
        .markAllAsTouched();

      return;
    }

    const v =
      this.firstUserForm
        .getRawValue();

    this.loading.set(true);

    this.usuarioService
      .create({

        nombre_completo:
          v.nombre_completo,

        username:
          v.username,

        email:
          v.email,

        password:
          v.password,

        rol:
          v.rol,

        telefono:
          v.telefono || null,

        activo: true,
      })

      .subscribe({

        next: (
          created
        ) => {

          this.loading.set(false);

          this.audit.select(
            created.id_usuario
          );

          void this.router
            .navigateByUrl('/app');
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.loading.set(false);

          this.snack.open(
            this.msg(err),
            'Cerrar',
            {
              duration: 6000,
            }
          );
        },
      });
  }

  private msg(
    err: HttpErrorResponse
  ): string {

    const d =
      err.error?.detail;

    if (
      typeof d === 'string'
    ) {
      return d;
    }

    if (
      Array.isArray(d)
    ) {

      return d
        .map(
          (x) =>
            x.msg ??
            JSON.stringify(x)
        )
        .join('; ');
    }

    return err.message;
  }
}