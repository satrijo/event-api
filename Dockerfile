FROM node:24-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm rebuild
RUN pnpm prisma generate
RUN pnpm build

USER node
EXPOSE 3000
CMD ["node", "dist/src/index.js"]