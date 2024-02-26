# Build stage
FROM node:21.6.1 as build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . ./

# Accept build-time arguments for environment variables
ARG REACT_APP_CHEAT_MODE
ARG REACT_APP_MAZE_SIZE
ARG REACT_APP_BACKEND_URL

# Set build-time environment variables for the React build process
ENV REACT_APP_CHEAT_MODE $REACT_APP_CHEAT_MODE
ENV REACT_APP_MAZE_SIZE $REACT_APP_MAZE_SIZE
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL

# Build your app
RUN npm run build

# Final stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the Docker host, so we can access it from the outside.
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
