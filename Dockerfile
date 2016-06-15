FROM node:wheezy

RUN mkdir /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

EXPOSE 7313

CMD ["node","index.js"]