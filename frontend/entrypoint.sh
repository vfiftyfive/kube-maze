#!/bin/sh

# Replace placeholders in your JS files with environment variable values
envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js

# Execute the command specified as CMD in Dockerfile (starts Nginx)
exec "$@"
