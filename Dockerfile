FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src/ ./src/
EXPOSE 2001
CMD ["node", "src/index.js"]
