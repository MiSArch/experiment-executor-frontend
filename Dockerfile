FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

ENV VITE_BACKEND_URL=http://localhost:8888

RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
