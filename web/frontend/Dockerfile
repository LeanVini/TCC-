FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN apk add --no-cache curl \
    && mkdir -p /var/cache/nginx/client_temp /run /var/run/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /run /var/run/nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . .
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /run /var/run/nginx

USER nginx

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
