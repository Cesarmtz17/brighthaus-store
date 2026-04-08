FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --production

COPY server/ ./server/
COPY site/ ./site/

EXPOSE 3000

CMD ["node", "server/index.js"]
