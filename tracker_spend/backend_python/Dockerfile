FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Expose port
EXPOSE 3001

# Start the application
CMD ["python", "app.py"]
