# Frontend — Restaurante

Aplicación web desarrollada con **Angular 20**  que
consume la API REST del backend de  un Restaurante. Permite
autenticarse con JWT y realizar operaciones CRUD sobre las entidades
principales del negocio.

---

## Video explicativo

> 🎥 **[Ver video en YouTube / Drive](https://youtu.be/iK3QpPdB7BE)**
> El video muestra: el backend y frontend desplegados en la web (render y firebase), flujo de login,
> demostración de CRUD en la entidad Platos y el como se registra una orden en el sistema.

---

## Repositorios

| Componente | URL |
|---|---|
| **Frontend** (este repo) | https://github.com/jaime-tovar/frontend-restaurante |
| **Backend** (API REST) | https://github.com/jaime-tovar/backend-restaurante |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/jaime-tovar/frontend-restaurante
cd frontend-restaurante

# 2. Instalar dependencias
npm install
```

---

## Configuración

La URL base de la API se configura en:

```
src/environments/environment.ts          ← desarrollo local
src/environments/environment.prod.ts    ← producción
```

Ejemplo `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',   // ← URL del backend FastAPI
};
```

Si el backend corre en un host diferente, actualiza `apiUrl` antes de
ejecutar la aplicación.

---

## Ejecución en desarrollo

```bash
npm start
# ó equivalentemente:
ng serve
```

La aplicación quedará disponible en **http://localhost:4200**.

> El backend debe estar corriendo en `http://127.0.0.1:8000` (o el host
> configurado en `environment.ts`) para que las peticiones funcionen.

---