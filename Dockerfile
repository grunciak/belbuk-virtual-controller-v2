FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY src/ ./src/
ENV PORT=2001
EXPOSE $PORT
CMD ["node", "src/index.js"]
