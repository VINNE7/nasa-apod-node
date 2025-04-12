# NASA APOD Email Service

A Node.js service that demonstrates how to handle background tasks using `setImmediate` for simpler use cases where a full Message Queue (MQ) solution might be overkill.

## Project Overview

This project is a practical example of using Node.js's `setImmediate` for background task processing. While Message Queues like RabbitMQ, Kafka, or Bull are excellent for complex, distributed systems, they might be unnecessary overhead for simpler tasks. This project showcases how to handle background processing effectively without the complexity of a full MQ solution.

## Key Features

- Fetches NASA's Astronomy Picture of the Day (APOD)
- Processes email requests asynchronously
- Uses SQLite with Drizzle ORM for job tracking
- Implements efficient batch processing for APOD requests

## Design Decisions

### Using `setImmediate` Instead of Message Queue

While Message Queues are powerful tools for distributed systems, they come with additional complexity and infrastructure requirements. This project demonstrates that for simpler tasks, `setImmediate` can be a viable alternative when:

- The task volume is moderate
- Immediate processing isn't critical
- The system is single-instance
- Job persistence isn't a strict requirement

### Efficient APOD Processing

One of the creative aspects of this project is how it handles the APOD data:

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

This approach:
- Reduces API calls to NASA's servers
- Processes multiple email requests efficiently
- Maintains data consistency across batch processing

### SMTP Rate Limiting Consideration

The project includes a note about SMTP server limitations:

```typescript
// when using a free tier smtp server, you will probably hit emails/second limit with this code
```

This is important because:
- Free SMTP services often have rate limits
- Batch processing might hit these limits
- Production deployments should consider:
  - Using a paid SMTP service
  - Implementing rate limiting
  - Adding delays between emails
  - Using a proper email service provider

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /nasa/request-apod
Request the APOD to be sent to your email.

Request body:
```json
{
  "email": "your.email@example.com"
}
```

## Technologies Used

- Node.js
- TypeScript
- Express
- Drizzle ORM
- SQLite
- Nodemailer
- Docker

## Docker Support

The project includes Docker configuration for easy deployment:

```bash
docker-compose up
```

## Note on Production Use

While this project demonstrates `setImmediate` usage, for production environments with high volume or requiring guaranteed processing, consider:

- Using a proper Message Queue
- Implementing retry mechanisms
- Adding monitoring and alerting
- Using a production-grade email service
- Implementing proper error handling and logging

## License

ISC 