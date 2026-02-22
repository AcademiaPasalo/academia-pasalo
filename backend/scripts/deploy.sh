#!/bin/bash
set -Eeuo pipefail

APP_DIR="/home/ubuntu/academia-pasalo"
COMPOSE_FILE="$APP_DIR/backend/docker-compose.prod.yml"

DB_HOST="172.31.65.82"
DB_PORT="3306"
MYSQL="mysql -u \"$DB_USER\" -p\"$DB_PASSWORD\" -h \"$DB_HOST\" -P \"$DB_PORT\""

cd "$APP_DIR"
git fetch origin
git reset --hard origin/main
git clean -fd -e letsencrypt/ -e certbot/ || true

# 1) Runtime dirs (certbot)
mkdir -p "$APP_DIR/certbot/www/.well-known/acme-challenge" "$APP_DIR/letsencrypt"
chown -R ubuntu:ubuntu "$APP_DIR/certbot" || true
chmod -R 755 "$APP_DIR/certbot" || true

# --- Google SA key (Drive) ---
# Requiere env var: GOOGLE_DRIVE_SA_JSON
sudo mkdir -p /opt/academia/secrets
sudo chown ubuntu:ubuntu /opt/academia/secrets
sudo chmod 700 /opt/academia/secrets

umask 077
cat > /opt/academia/secrets/google-drive-sa.json <<EOF
${GOOGLE_DRIVE_SA_JSON}
EOF

sudo chown ubuntu:ubuntu /opt/academia/secrets/google-drive-sa.json
sudo chmod 600 /opt/academia/secrets/google-drive-sa.json

# 2) Validar compose
[ -f "$COMPOSE_FILE" ] || { echo "ERROR: No existe $COMPOSE_FILE"; ls -la "$APP_DIR/backend" || true; exit 1; }

# 3) Login Docker
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# 4) Crear .env backend
cat > "$APP_DIR/backend/.env" <<EOF
GITHUB_REPOSITORY=${GITHUB_REPOSITORY}
DOCKER_USERNAME=$DOCKER_USERNAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI
MAXMIND_LICENSE_KEY=$MAXMIND_LICENSE_KEY
CORS_ORIGINS=$CORS_ORIGINS
GOOGLE_APPLICATION_CREDENTIALS=/opt/academia/secrets/google-drive-sa.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=$GOOGLE_DRIVE_ROOT_FOLDER_ID
STORAGE_PROVIDER=$STORAGE_PROVIDER
EOF

# 5) Deploy
docker-compose -f "$COMPOSE_FILE" pull
docker-compose -f "$COMPOSE_FILE" down
docker-compose -f "$COMPOSE_FILE" up -d

# 6) Esperar MySQL host
for i in $(seq 1 60); do
  if eval "$MYSQL -D \"$DB_NAME\" -e \"SELECT 1;\" >/dev/null 2>&1"; then
    echo "✅ MySQL host disponible"
    break
  fi
  sleep 2
done
eval "$MYSQL -D \"$DB_NAME\" -e \"SELECT 1;\" >/dev/null 2>&1" || { echo "❌ MySQL host no responde"; sudo systemctl status mysql --no-pager || true; exit 1; }

# 7) Scripts SQL
eval "$MYSQL \"$DB_NAME\" < \"$APP_DIR/backend/db/eliminar_tablas_academia_pasalo_v1.sql\""
eval "$MYSQL \"$DB_NAME\" < \"$APP_DIR/backend/db/creacion_tablas_academia_pasalo_v1.sql\""
eval "$MYSQL \"$DB_NAME\" < \"$APP_DIR/backend/db/datos_iniciales_academa_pasalo_v1.sql\""
eval "$MYSQL \"$DB_NAME\" < \"$APP_DIR/backend/db/datos_prueba_cursos_y_matriculas.sql\""

# 8) Verificar BD
TABLES_COUNT=$(eval "$MYSQL -D \"$DB_NAME\" -sN -e \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';\" 2>/dev/null" || echo "0")
[ "$TABLES_COUNT" -gt 0 ] || { echo "❌ Error en scripts SQL"; exit 1; }
echo "✅ BD inicializada: $TABLES_COUNT tablas"

# 9) Verificar contenedores clave
for c in academia-pasalo-nginx academia-pasalo-backend academia-pasalo-frontend; do
  docker inspect "$c" >/dev/null 2>&1 || { echo "❌ $c no existe"; docker ps; exit 1; }
  [ "$(docker inspect -f '{{.State.Status}}' "$c")" = "running" ] || { echo "❌ $c no está running"; docker logs --tail=200 "$c"; exit 1; }
done

# 10) Verificación del archivo dentro del contenedor
docker exec academia-pasalo-backend sh -lc 'ls -l /opt/academia/secrets/google-drive-sa.json && test -s /opt/academia/secrets/google-drive-sa.json' >/dev/null 2>&1 || {
  echo "❌ El backend no ve /opt/academia/secrets/google-drive-sa.json o está vacío"
  docker inspect academia-pasalo-backend --format '{{range .Mounts}}{{println .Source "->" .Destination}}{{end}}' | grep -n 'google-drive-sa' || true
  exit 1
}

docker image prune -f
echo "✅ Deploy completado"
docker ps