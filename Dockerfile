FROM node:lts-slim

ADD src /opt/app/src
WORKDIR /opt/app
COPY package.json ./
COPY bouygues_speak.otf ./

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install

CMD ["npm", "start"]