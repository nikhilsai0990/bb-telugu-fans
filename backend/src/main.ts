import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import helmet from "helmet";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env if present
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../../.env"),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
      break;
    }
  }
}
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers (Section 47)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'", "http://localhost:*", "https://*"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: "deny" },
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  // Cookie parser for secure HttpOnly cookie management (Section 25)
  app.use(cookieParser());

  // CORS Configuration - Strictly restricted to authorized origins (Port 9000 & production domains)
  const allowedOrigins = [
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  const trustedDomainRegex = /^(https:\/\/[a-zA-Z0-9-]+\.vercel\.app|https:\/\/(www\.)?bbtelugufans\.com)$/;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin) || trustedDomainRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Voter-Token", "CF-Connecting-IP"],
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Versioned API Prefix (Section 33: /api/v1/)
  app.setGlobalPrefix("api/v1");

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[BB Telugu Fans API] Modular Monolith running on http://localhost:${port}/api/v1`);
}
bootstrap();