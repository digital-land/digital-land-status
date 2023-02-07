FROM node:16
RUN npm install -g npm
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY server.js .
COPY tests.js .
ARG DEPLOY_TIME
ENV DEPLOY_TIME=$DEPLOY_TIME
RUN echo "$DEPLOY_TIME" >> DEPLOY_TIME

CMD ["npm", "start"]
