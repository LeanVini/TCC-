FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install --only=production && npm cache clean --force

# Copy source
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

EXPOSE 3000

CMD ["npm", "start"]
