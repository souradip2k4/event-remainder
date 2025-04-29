FROM node:22.0-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm prune --production

RUN ls

EXPOSE 3000

CMD ["npm", "run", "start"]