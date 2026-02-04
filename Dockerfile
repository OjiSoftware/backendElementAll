FROM node:20-alpine

WORKDIR /app

# Copiamos dependencias primero
COPY package*.json ./
RUN npm install

# Copiamos el resto
COPY . .

# Generamos Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Correr TS directo con hot reload
CMD ["npx", "ts-node-dev", "--respawn", "src/server.ts"]
