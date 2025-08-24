FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild esbuild
RUN npm install && npm rebuild esbuild

# Install chart.js dependencies
RUN npm install chart.js react-chartjs-2
RUN npm install lucide-react
RUN npm install framer-motion@^10.16.4
# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
