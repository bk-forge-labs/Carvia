FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
RUN mkdir -p /data/uploads && chown node:node /data/uploads
ENV NODE_ENV=production PORT=5050 UPLOAD_DIR=/data/uploads
USER node
EXPOSE 5050
CMD ["node", "app.js"]
