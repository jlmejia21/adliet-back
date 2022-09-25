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
} from './config/constants';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';

import { AccessControlModule } from 'nest-access-control';
import { roles } from './app.roles';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>(DATABASE_HOST),
        port: parseInt(config.get<string>(DATABASE_PORT), 10),
        username: config.get<string>(DATABASE_USERNAME),
        password: config.get<string>(DATABASE_PASSWORD),
        database: config.get<string>(DATABASE_NAME),
        entities: [__dirname + './**/**/*entity{.ts,.js}'],
        ssl: {
          ca: config.get<string>(DATABASE_CERT),
        },
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        logger: 'file',
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AccessControlModule.forRoles(roles),
    UserModule,
    // PostModule,
    StoreModule,
    AuthModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
