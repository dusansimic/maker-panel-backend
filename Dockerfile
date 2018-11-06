FROM node:10
ENV NODE_ENV production
ENV DB_NAME makerpanel
ENV SERVER_URL mongodb://maker:maker123@ds115198.mlab.com:15198/makerpanel
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
CMD npm start