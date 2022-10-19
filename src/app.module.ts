import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {
  DATABASE_CERT,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USERNAME,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_USER,
} from './config/constants';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './app.roles';
import { EmailModule } from './email/email.module';
import { OrderModule } from './order/order.module';
import { ProcessModule } from './process/process.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>(DATABASE_HOST),
        port: parseInt(config.get<string>(DATABASE_PORT), 10),
        username: config.get<string>(DATABASE_USERNAME),
        password: config.get<string>(DATABASE_PASSWORD),
        database: config.get<string>(DATABASE_NAME),
        ssl: {
          rejectUnauthorized: true,
          ca: config.get<string>(DATABASE_CERT),
        },
        entities: [__dirname + './**/**/*entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        logger: 'file',
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>(EMAIL_HOST),
          secure: true,
          auth: {
            user: config.get<string>(EMAIL_USER),
            pass: config.get<string>(EMAIL_PASSWORD),
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    AccessControlModule.forRoles(roles),
    UserModule,
    StoreModule,
    AuthModule,
    OrderModule,
    ProcessModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
