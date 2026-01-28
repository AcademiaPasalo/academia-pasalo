# Lógica de Negocio Crítica y Seguridad - Documentación Técnica

Este documento detalla la implementación técnica de los flujos más complejos del sistema, explicando cómo se orquestan los archivos, qué tablas se afectan y cómo se garantiza la integridad de los datos.

## 1. Sistema de Matrículas Dinámicas y Reactivas

### Problema
En sistemas tradicionales, la matrícula es una "foto estática". Si un profesor agregaba un examen nuevo después de que el alumno pagó el "Curso Completo", el alumno no tenía acceso.

### Solución Técnica
Implementamos un sistema híbrido que combina una transacción inicial con un patrón Observador (Subscriber) para garantizar consistencia eventual inmediata.

#### A. Flujo de Matrícula (EnrollmentsService)
**Archivos:** `src/modules/enrollments/application/enrollments.service.ts`

1. **Intención de Compra:** Se recibe `enrollmentTypeCode` ('FULL' o 'PARTIAL').
2. **Transacción ACID:** Todo ocurre dentro de `dataSource.transaction`.
3. **Lógica de Selección:**
   - Si es **FULL**: Se buscan todas las evaluaciones del ciclo actual Y ciclos pasados del mismo curso (`CourseCycleRepository`).
   - Si es **PARTIAL**: Se validan estrictamente los IDs de evaluaciones enviados por el cliente.
4. **Cálculo de Vigencia (Clamping):**
   - Para el **Banco de Enunciados** (que dura todo el ciclo), si la matrícula es PARTIAL, el sistema calcula la fecha de fin de la evaluación académica más tardía comprada y fuerza la fecha de fin del Banco a esa fecha.
   - **Query Implícita (Lógica):** `MAX(evaluation.end_date)` de las evaluaciones compradas.
5. **Persistencia:** Se inserta en `enrollment` y masivamente en `enrollment_evaluation`.

**Tablas Afectadas:**
- `enrollment` (Cabecera)
- `enrollment_evaluation` (Detalle - Única fuente de verdad de acceso)

#### B. Reactividad Automática (EvaluationSubscriber)
**Archivos:** `src/modules/evaluations/infrastructure/evaluation.subscriber.ts`

1. **Trigger:** Se dispara `afterInsert` cada vez que se crea una `Evaluation`.
2. **Detección:** El sistema busca todos los registros en `enrollment` asociados al `course_cycle_id` de la nueva evaluación que tengan `enrollment_type.code = 'FULL'`.
3. **Inyección de Permisos:**
   - Itera sobre los alumnos encontrados.
   - Crea automáticamente el registro en `enrollment_evaluation` para la nueva evaluación.
4. **Resultado:** El alumno ve el nuevo examen en tiempo real sin que el administrador toque nada.

---

## 2. Acceso Histórico (Valor Agregado)

### Lógica
Permitir que un alumno matriculado en el ciclo actual (ej. 2026-1) acceda a exámenes de ciclos anteriores (ej. 2025-2) para practicar.

**Archivos:** `src/modules/enrollments/application/enrollments.service.ts`

1. **Búsqueda de Ciclos:** Al procesar una matrícula `FULL`, el servicio busca en `course_cycle` otros ciclos que compartan el mismo `course_id` pero cuya `start_date` sea menor a la actual.
2. **Extensión de Vigencia:**
   - Las evaluaciones pasadas ya vencieron (su `end_date` es antigua).
   - El sistema sobrescribe la `access_end_date` en la tabla `enrollment_evaluation` usando la `end_date` del **ciclo académico actual**.
3. **Resultado:** El alumno ve material antiguo habilitado hasta que termine su ciclo actual.

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
