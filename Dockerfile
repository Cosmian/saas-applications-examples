# Stage 1: Build the frontend application
FROM node:18 

# Copy project files in /app folder
RUN mkdir -p /app
WORKDIR /app
COPY . /app

# Install dependencies and build the application
RUN npm install
RUN npm run build

# Command to start your application
CMD ["npm", "run", "preview", "--", "--host"]
