FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 4173
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173
ENV APPWRITE_KEY=rand
ENV PUBLIC_APPWRITE_ENDPOINT=rand
ENV PUBLIC_APPWRITE_PROJECT=rand
CMD [ "node", "build" ]
