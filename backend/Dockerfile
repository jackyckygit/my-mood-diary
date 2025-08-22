# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

EXPOSE 5000

CMD [ "node", "src/index.js" ]