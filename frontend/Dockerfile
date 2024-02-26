# Build stage
FROM node:21.6.1 as build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . ./

# Build your app
RUN npm run build

# Final stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

# Copy the entrypoint script from the build stage
COPY --from=build /app/entrypoint.sh /usr/local/bin/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy the config template from the build stage
COPY --from=build /app/public/config.js.template /usr/share/nginx/html/config.js.template

# Expose port 80 to the Docker host, so we can access it from the outside.
EXPOSE 80

# Set the entrypoint script to run when the container starts
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
