FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY assets ./assets

RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=builder /app/dist/ /usr/share/nginx/html/frontend/
COPY --from=builder /app/assets /usr/share/nginx/html/frontend/assets
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
