FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY assets ./assets

ENV VITE_BACKEND_URL=http://129.69.217.214

RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/assets /usr/share/nginx/html/assets

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
