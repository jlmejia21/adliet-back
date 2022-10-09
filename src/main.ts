import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './app.swagger';
import { PORT } from './config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  initSwagger(app);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const configService = app.get<ConfigService>(ConfigService);
  const port: number = configService.get<number>(PORT);
  await app.listen(port);
  logger.log(`Server is running in ${await app.getUrl()}`);
}
bootstrap();
