#- development
#FROM node:18

# Establece una variable de entorno
#ARG NODE_ENV=development
#-ARG NODE_ENV=production
#-ENV NODE_ENV=$NODE_ENV

#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install
#COPY . .
#EXPOSE 3000
#CMD ["npm", "run", "dev"]


#- production
FROM node:18
WORKDIR /usr/src/app

# Actualiza los repositorios e instala el cliente de MariaDB
RUN apt-get update && \
    apt-get install -y mariadb-client

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
