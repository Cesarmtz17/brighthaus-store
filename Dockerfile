FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --production

COPY server/ ./server/
COPY site/ ./site/

EXPOSE 3000

CMD ["node", "server/index.js"]
