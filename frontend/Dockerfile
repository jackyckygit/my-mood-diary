# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application for production
ARG REACT_APP_API_BASE_URL 
# this one just for checking the arg in the build env, not in the container
RUN echo $REACT_APP_API_BASE_URL
RUN env REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built files from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]