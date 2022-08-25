FROM node:16.12.0

# Create app directory, this is in our container/in our image
# RUN mkdir -p /usr/src/app
WORKDIR "/app"

#RUN npm install -g pnpm
RUN npm config set registry http://registry.npmjs.org/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (yarn@5+)
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
# TODO: remove this files (enhance Dockerfile)
COPY .eslintrc.json ./

RUN npm install 

COPY . .

# If you are building your code for production
# RUN yarn ci --only=production

# Bundle app source

#RUN yarn build

EXPOSE 8050
CMD [ "npm", "run", "start-dev" ]
