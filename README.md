# mutatio.dev - A Modern LLM Prompt Experimentation Platform

![mutatio.dev](https://mutatio.dev/opengraph-image.png)

**mutatio.dev** is a powerful tool for prompt engineers, AI developers, and LLM enthusiasts to systematically create, test, and refine prompts. Built with privacy as a priority, mutatio.dev keeps your API keys and data secure by processing everything locally in your browser.

## What is Mutatio?

Mutatio (latin for "change" or "mutation") helps you iteratively improve your prompts through:

- **Controlled Mutations**: Apply different transformation strategies to your base prompts
- **Systematic Testing**: Compare different versions across multiple LLM providers
- **Version Control**: Track your prompt evolution over time with detailed history
- **Privacy-First Design**: All processing happens in your browser - no server receives your API keys

## Key Features

- **Multiple Mutation Types**: Create and manage different mutation strategies
- **Multi-Provider Support**: Test with OpenAI, Anthropic, Mistral, and DeepSeek models
- **Local API Key Storage**: Client-side encrypted storage keeps your API keys on your device
- **Versioned Prompts**: Track the evolution of your mutations with detailed analytics
- **Comprehensive History**: Compare results across iterations with visual diffs
- **Customizable Validation**: Configure evaluation criteria for prompt performance

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/albertoperdomo2/mutatio.dev.git
cd mutatio
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment variables
```bash
cp .env.example .env
```

4. Generate a secure encryption key
```bash
node scripts/generate-encryption-key.js
```

5. Set up the database
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

6. Start the development server
```bash
npm run dev
```

### Required Environment Variables

mutatio.dev requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `ENCRYPTION_KEY`: Generated with scripts/generate-encryption-key.js
- `NEXTAUTH_SECRET`: Secret for NextAuth authentication
- `NEXTAUTH_URL`: Your application's URL

See `.env.example` for all available configuration options.

## Security

mutatio.dev is designed with privacy and security in mind:

- **Client-side Processing**: Your prompts and API interactions happen directly in your browser
- **Local Storage Encryption**: API keys are encrypted before being stored in your browser
- **No Server Storage**: Your API keys are never sent to our servers
- **Environment-based Keys**: All encryption keys are stored as environment variables

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Issues**: Open an issue for bugs or feature requests
2. **Submit PRs**: Code contributions are welcome
3. **Documentation**: Help improve or translate documentation
4. **Testing**: Try mutatio.dev with different models and use cases

### Contribution Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with automatic fixes

## License

[MIT](LICENSE)
