# Etapa 1: Buildeo
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Puertos
EXPOSE 3001
ENV PORT=3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]
