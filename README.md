# NASA APOD Email Service

A Node.js service that demonstrates efficient background task processing using `setImmediate` instead of a full Message Queue solution. This project showcases how to handle simpler async tasks without over-engineering, while still maintaining reliability and performance.

## 🚀 Features

- Fetches NASA's Astronomy Picture of the Day (APOD)
- Processes email requests asynchronously using `setImmediate`
- Efficient batch processing of multiple email requests
- SQLite database with Drizzle ORM for job tracking
- APOD data caching to minimize NASA API calls
- Docker support for easy deployment
- Load testing with k6
- TypeScript for type safety
- Error handling with custom exceptions

## 🏗️ Architecture

The project demonstrates a simple yet effective architecture for background task processing:

```typescript
// Instead of fetching APOD for each email request:
const apod = await getApod();
const pendingJobs = await jobRepository.getPendingJobs(10);

// Process multiple emails with the same APOD data
const results = await Promise.allSettled(
  pendingJobs.map(async (job) => {
    // ... process job with the same APOD data
  })
);
```

### Key Components

- **Job Processing**: Uses `setImmediate` for background tasks
- **Data Caching**: Implements APOD caching to reduce API calls
- **Error Handling**: Custom exception handling with context
- **Database**: SQLite with Drizzle ORM for persistence
- **Email Service**: Configurable SMTP integration

## 🛠️ Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- Docker and Docker Compose (optional)
- NASA API key
- SMTP credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nasa-apod-node.git
   cd nasa-apod-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

Run with Docker Compose:
```bash
docker-compose up
```

This will:
- Build the application
- Run database migrations
- Start the server
- Execute load tests (optional)

## 📝 API Endpoints

### POST /nasa/request-apod
Request the APOD to be sent to your email.

Request body:
```json
{
  "email": "your.email@example.com"
}
```

Response:
```json
{
  "message": "request accepted"
}
```

## 🧪 Load Testing

The project includes k6 load testing scripts that run automatically when you start the application with Docker Compose:

```bash
docker-compose up
```

This will:
- Start the application
- Run the k6 load tests against the application
- Show test results in the console

The load tests are configured in `k6/loadtest.js` with the following defaults:
- 1 virtual user
- 10-second duration
- 1-second sleep between requests

You can modify these settings by editing the `k6/loadtest.js` file.

## ⚙️ Configuration

Key environment variables:
```env
PORT=3000
DB_FILE_NAME=./sqlite/mydb.sqlite
NASA_API_URL=https://api.nasa.gov/planetary
NASA_API_KEY=your_nasa_api_key_here
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## 🎯 When to Use This Approach

This project demonstrates that `setImmediate` can be a viable alternative to Message Queues when:

- Task volume is moderate
- Immediate processing isn't critical
- System is single-instance
- Job persistence isn't a strict requirement
- You want to avoid additional infrastructure

## 📊 Performance Considerations

- Batch processing of jobs
- APOD data caching
- Efficient database operations
- Concurrent email processing
- Rate limiting for SMTP servers

## 🚨 Production Considerations

While this project demonstrates `setImmediate` usage, for production environments with high volume or requiring guaranteed processing, consider:

- Using a proper Message Queue
- Implementing retry mechanisms
- Adding monitoring and alerting
- Using a production-grade email service
- Implementing proper error handling and logging

## 📚 License

ISC 