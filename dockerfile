FROM node:20-alpine

# Instalar OpenSSL
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# --- AQUÍ ESTÁ EL CAMBIO ---
# Definimos una DATABASE_URL falsa solo para este comando.
# Esto engaña a Prisma para que genere el cliente sin fallar por falta de variable.
RUN DATABASE_URL="mysql://usuario:password@localhost:3306/db_falsa" npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]