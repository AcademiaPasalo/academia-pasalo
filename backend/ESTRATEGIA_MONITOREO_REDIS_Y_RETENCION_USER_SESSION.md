# Estrategia de Monitoreo Redis y Retencion de `user_session`

## 1. Objetivo

Definir una implementacion profesional, de bajo costo y operable, para:

1. Monitorear Redis/BullMQ y salud de infraestructura.
2. Definir retencion de `user_session` a 60 dias sin riesgo para sesiones activas.

Esta estrategia prioriza confiabilidad, trazabilidad y facilidad operativa.

## 2. Contexto Actual

1. Existe una sola instancia Redis para cache y colas (BullMQ).
2. Redis tiene limite de memoria y politica de eviccion LRU en despliegue.
3. `user_session` crece con cada login y debe controlarse por retencion.
4. La seguridad del backend depende de Redis para partes criticas de sesion/colas.

## 3. Estrategia de Monitoreo (Recomendada y Gratuita)

### 3.1 Stack recomendado

1. Prometheus (recoleccion de metricas).
2. Grafana (dashboards y alertas).
3. `redis_exporter` (metricas Redis).
4. `node_exporter` (metricas del host: CPU, RAM, disco).
5. `cadvisor` (metricas por contenedor Docker).

Justificacion:

1. Es gratuito y self-hosted.
2. Permite alertas preventivas (no solo revisar logs despues del incidente).
3. Cubre Redis y tambien backend/host, reduciendo puntos ciegos.

### 3.2 Metricas minimas obligatorias

#### Redis

1. `used_memory` y porcentaje sobre `maxmemory`.
2. `evicted_keys`.
3. `connected_clients`.
4. `blocked_clients`.
5. latencia de comando (`latency`/slowlog cuando aplique).

#### BullMQ (aplicacion)

1. jobs `failed`.
2. jobs `stalled`.
3. jobs `delayed` acumulados.
4. tiempo medio de procesamiento por cola.

#### Infraestructura (host/contenedores)

1. CPU host y CPU por contenedor.
2. RAM host y RAM por contenedor.
3. disco libre del host.
4. reinicios de contenedores.

### 3.3 Umbrales de alerta iniciales

1. Redis memoria > 85% por 10 minutos.
2. `evicted_keys > 0` (critico).
3. BullMQ `stalled` en aumento sostenido.
4. BullMQ `failed` en aumento sostenido.
5. Host RAM > 90% por 10 minutos.
6. Disco host > 80%.

### 3.4 Runbook (que hacer ante cada alerta)

#### Alerta: Redis > 85%

1. Revisar claves con mayor consumo.
2. Reducir TTL de cache no critica.
3. Verificar crecimiento anomalo de colas.
4. Si persiste, aumentar memoria o separar Redis por rol.

#### Alerta: `evicted_keys > 0`

1. Tratar como incidente.
2. Revisar impacto en BullMQ (`stalled`, `failed`, reintentos inesperados).
3. Reducir presion inmediata (carga/TTL/cache).
4. Planificar cambio de arquitectura (separar cache y colas) si reaparece.

#### Alerta: BullMQ `stalled/failed`

1. Correlacionar con memoria Redis y CPU host.
2. Revisar workers y timeouts de jobs.
3. Reprocesar jobs afectados si aplica.

### 3.5 Politica de memoria Redis (con 1 sola instancia)

Situacion actual aceptable temporal:

1. Mantener una sola instancia Redis mientras el trafico lo permita.

Riesgo:

1. Con LRU, bajo presion pueden expulsarse claves relevantes para flujos de cola/cache.

Plan de madurez:

1. Corto plazo: monitoreo + alertas + runbook.
2. Mediano plazo: separar Redis de colas y Redis de cache.
3. Redis de colas: preferible `noeviction`.
4. Redis de cache: LRU segun estrategia de cache.

## 4. Estrategia de Retencion `user_session` (60 dias)

### 4.1 Politica acordada

1. Eliminar registros de `user_session` con antiguedad mayor a 60 dias.
2. Nunca eliminar sesiones activas.

### 4.2 Criterio de borrado seguro

Un registro es elegible si cumple:

1. `is_active = false`.
2. Estado de sesion no activo (ej. `REVOKED` o equivalente).
3. `expires_at < NOW()`.
4. `last_activity_at` o `created_at` con antiguedad > 60 dias.

Nota:

1. Aunque por logica una sesion activa no deberia estar 60 dias, el filtro de seguridad debe ser explicito.

### 4.3 Implementacion recomendada

1. Job programado (diario en ventana de baja carga).
2. Borrado por lotes (batch) para evitar bloqueos largos.
3. Registrar en auditoria:
   - fecha/hora,
   - total de filas eliminadas,
   - criterio usado (retencion 60 dias),
   - actor tecnico del sistema.

### 4.4 Justificacion de 60 dias

1. Balancea trazabilidad operativa y control de crecimiento.
2. Mantiene ventana razonable para investigacion de incidentes recientes.
3. Reduce costo de almacenamiento y tiempo de consultas operativas.

## 5. Responsabilidades (Backend vs DevOps)

### 5.1 Backend

1. Exponer metricas de aplicacion/BullMQ.
2. Implementar job de limpieza de `user_session`.
3. Garantizar filtros de borrado seguro.
4. Registrar auditoria del cleanup.

### 5.2 DevOps

1. Desplegar stack de monitoreo (Prometheus, Grafana, exporters).
2. Configurar scraping, retencion de metricas y alertas.
3. Asegurar que dashboards y canales de alerta funcionen.
4. Operar capacidad de host/Redis.

### 5.3 Trabajo coordinado

1. Definir umbrales finales segun carga real.
2. Revisar alertas semanalmente durante periodo inicial.
3. Ajustar politicas con datos reales de produccion.

## 6. Ambientes (Local y Produccion)

1. Se puede usar en ambos ambientes.
2. Local:
   - util para pruebas funcionales de dashboards/alertas.
   - no representa volumen real.
3. Produccion:
   - obligatorio para operacion real.
   - fuente de verdad para capacidad y riesgos.

Recomendacion:

1. Empezar en local para validar integracion.
2. Activar en produccion con umbrales conservadores.
3. Refinar umbrales luego de 2 a 4 semanas de datos.

## 7. Checklist de Cierre

1. Dashboards creados (Redis, BullMQ, Host, Contenedores).
2. Alertas activas y probadas.
3. Runbook documentado y validado.
4. Job de retencion de `user_session` activo.
5. Auditoria del cleanup verificada.
6. Prueba de no eliminacion de sesiones activas validada.
