# Logica de Negocio Critica y Seguridad - Documentacion Tecnica

Este documento detalla la implementacion tecnica de los flujos mas complejos del sistema, explicando como se orquestan los archivos, que tablas se afectan y como se garantiza la integridad de los datos.

## 1. Sistema de Matriculas Dinamicas y Reactivas

### Problema
En sistemas tradicionales, la matricula es una foto estatica. Si un profesor agregaba un examen nuevo despues de que el alumno pago el Curso Completo, el alumno no tenia acceso.

### Solucion Tecnica
Implementamos un sistema hibrido que combina una transaccion inicial con un patron Observador (Subscriber) para garantizar consistencia eventual inmediata.

#### A. Flujo de Matricula (EnrollmentsService)
**Archivos:** `src/modules/enrollments/application/enrollments.service.ts`

1. **Intencion de Compra:** Se recibe `enrollmentTypeCode` ('FULL' o 'PARTIAL').
2. **Transaccion ACID:** Todo ocurre dentro de `dataSource.transaction`.
3. **Logica de Seleccion:**
   - Si es **FULL**: Se buscan todas las evaluaciones del ciclo actual y ciclos historicos especificados.
   - Si es **PARTIAL**: Se validan los IDs de evaluaciones enviados, que pueden pertenecer al ciclo actual o a ciclos historicos especificados en `historicalCourseCycleIds`.
4. **Vigencia Unificada:**
   - Toda evaluacion concedida (FULL o PARTIAL) persiste una ventana unica de acceso en `enrollment_evaluation`.
   - `access_start_date` = inicio del ciclo academico del `courseCycle` base de la matricula.
   - `access_end_date` = fin del ciclo academico del `courseCycle` base de la matricula.
   - Ya no existe clamping por evaluacion mas lejana ni fallback por simil historico para calcular la fecha fin.
5. **Persistencia:** Se inserta en `enrollment` y masivamente en `enrollment_evaluation`.

**Tablas Afectadas:**
- `enrollment` (Cabecera)
- `enrollment_evaluation` (Detalle - unica fuente de verdad de acceso)

#### B. Reactividad Automatica (EvaluationSubscriber)
**Archivos:** `src/modules/evaluations/infrastructure/evaluation.subscriber.ts`

1. **Trigger:** Se dispara `afterInsert` cada vez que se crea una `Evaluation`.
2. **Deteccion por tipo de evaluacion:**
   - Si la nueva evaluacion es `BANCO_ENUNCIADOS`, se otorga acceso automatico a toda matricula activa del curso/ciclo.
   - Si no es banco, se otorga acceso automatico solo a matriculas activas de tipo `FULL`.
3. **Inyeccion de Permisos:**
   - Itera sobre los alumnos encontrados.
   - Crea automaticamente el registro en `enrollment_evaluation` para la nueva evaluacion.
4. **Resultado:** El alumno ve el nuevo examen en tiempo real sin que el administrador toque nada.

---

## 2. Acceso Historico (Valor Agregado)

### Logica
Permitir que un alumno matriculado acceda a evaluaciones de ciclos anteriores (ej. 2025-2) para practicar.

**Archivos:** `src/modules/enrollments/application/enrollments.service.ts`

1. **Aplicacion:** Funciona tanto para matriculas **FULL** como **PARTIAL** mediante el campo `historicalCourseCycleIds`.
2. **Busqueda de Ciclos:** El servicio busca en `course_cycle` los ciclos especificados que compartan el mismo `course_id` y cuya `start_date` sea menor a la actual.
3. **Diferencia por Tipo:**
   - **FULL**: Accede a todas las evaluaciones de los ciclos historicos.
   - **PARTIAL**: Accede solo a las evaluaciones especificas indicadas en `evaluationIds` (pueden ser de ciclos pasados).
4. **Vigencia en historico:**
   - Aunque la evaluacion historica tenga `end_date` antigua, la vigencia de acceso se guarda hasta el fin del ciclo academico actual del curso base matriculado.
5. **Resultado:** El alumno ve material antiguo habilitado hasta que termine su ciclo actual.

---

## 3. Seguridad: Detección de Anomalías y Cuentas Compartidas

Aquí abordamos cómo distinguimos el uso legítimo del compartido, incluso en distancias cortas.

### A. Sesiones Concurrentes (Anti-Préstamo Simultáneo)
Evita que dos personas usen la cuenta al mismo tiempo, sin importar dónde estén.

**Archivos:** `src/modules/auth/application/auth.service.ts`

1. **Detección:** Antes de crear una sesión, consultamos:
   ```sql
   SELECT * FROM user_session 
   WHERE user_id = ? AND is_active = true
   ```
2. **Resolución:** Si existe resultado, el login se detiene. El sistema responde `PENDING_CONCURRENT_RESOLUTION`.
3. **Decisión del Usuario:** El usuario debe elegir:
   - "Desconectar al otro" (Revoca el token anterior).
   - "Cancelar" (No entra).
4. **Efectividad:** Es el método más eficaz para evitar préstamos de cuentas activos.

### B. Viaje Imposible (Impossible Travel) - Distancias Largas
Detecta si alguien se loguea en Madrid y 5 minutos después en Tokio.

**Archivos:** `src/modules/auth/application/security-event.service.ts`

1. **Cálculo:**
   - Se obtiene la última ubicación conocida (`lat`, `long`) y su `timestamp`.
   - Se compara con la ubicación del intento actual.
   - Fórmula: `Velocidad = Distancia (Haversine) / Tiempo Transcurrido`.
2. **Umbral:** Si la velocidad > 800 km/h (velocidad promedio de avión comercial), se marca como anómalo.

### C. Detección en Distancias Cortas (El caso "Amigo a 20 min")
El uso de IP (GeoIP) tiene un margen de error de ciudad (10-40km). No sirve para detectar si le presté la cuenta a mi vecino. Para esto, el backend está preparado para usar **Geolocalización GPS Precisa**.

**Estrategia Implementada:**

1. **Device Fingerprinting (`device_id`):**
   - Aunque estén en la misma casa, si usan dispositivos diferentes (móvil vs laptop), el `device_id` cambia.
   - El sistema fuerza una re-autenticación si el `refresh_token` no coincide con el dispositivo original.

2. **GPS vs IP:**
   - La tabla `user_session` tiene columnas `latitude` y `longitude` (DECIMAL 10,7).
   - Si el Frontend solicita permiso de ubicación al navegador y envía las coordenadas exactas:
     - El backend calcula la distancia exacta.
     - Si la distancia es > 1km en < 1 minuto, salta la alarma.
   - **Nota:** Si solo confiamos en la IP, este caso es indetectable. Por eso el backend prioriza el `device_id` y las sesiones concurrentes para controlar el préstamo local.

**Tablas Afectadas:**
- `user_session`: Almacena coordenadas, IP, device_id y estado.
- `security_event`: Registra el historial de intentos y motivos de bloqueo.

### D. Refresh Token Rotation con `jti` (Fortalecimiento de Identidad)

Para evitar ambiguedades en renovacion de sesion y mejorar trazabilidad, el backend ahora usa `jti` (JWT ID) en refresh tokens.

**Archivos:** `src/modules/auth/application/token.service.ts`, `src/modules/auth/application/auth.service.ts`, `src/modules/auth/application/session.service.ts`, `src/modules/auth/infrastructure/user-session.repository.ts`

1. **Emision de refresh token:**
   - Se genera `jti` unico por token de refresh.
   - Ese `jti` viaja dentro del JWT (claim `jti`).
2. **Persistencia de sesion:**
   - La tabla `user_session` guarda `refresh_token_jti`.
   - El lookup de sesion para refresh y reauth usa `refresh_token_jti` con lock pesimista.
3. **Rotacion segura:**
   - En cada refresh se emite nuevo token con nuevo `jti`.
   - Se actualiza la sesion en transaccion.
   - Se invalida cache de sesion y se blacklistea hash del refresh anterior.
4. **Contrato API:**
   - No cambia el contrato con frontend.
   - El frontend sigue enviando/recibiendo `refreshToken` como antes.
   - `jti` es control interno del backend.

### E. IP Confiable (Pendiente de Cierre con DevOps)

La deteccion de anomalias basada en IP depende de una cadena de proxies confiable.

Estado actual:
- Pendiente de coordinacion con DevOps para cerrar configuracion final de IP confiable.
- Objetivo tecnico: usar IP resuelta por la plataforma (`request.ip`) con `trust proxy` correctamente definido segun topologia real de despliegue.
- Riesgo si no se cierra: posibilidad de contaminar auditoria de seguridad con headers de IP manipulados.
