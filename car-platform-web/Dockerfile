FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG PUBLIC_ORIGIN
ENV NEXT_PUBLIC_API_BASE_URL=${PUBLIC_ORIGIN}/api
ENV NEXT_PUBLIC_API_ORIGIN=${PUBLIC_ORIGIN}
ENV API_INTERNAL_BASE_URL=http://api:5050/api
RUN npm run build
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
