FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && mkdir -p /app

COPY package*.json ./

RUN npm install --only=production && npm cache clean --force

COPY . .
RUN chown -R appuser:appgroup /app

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

EXPOSE 3000

CMD ["npm", "start"]
