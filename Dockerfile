FROM node:16
RUN npm install -g npm
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY server.js .
COPY tests.js .
ARG DEPLOY_TIME
ARG now
ENV DEPLOY_TIME=$DEPLOY_TIME
ENV build_date=$now
# RUN echo "$DEPLOY_TIME" >> DEPLOY_TIME
RUN echo "$build_date" >> DEPLOY_TIME
RUN echo "$build_date" >> DEPLOY_TIME1

CMD ["npm", "start"]
