import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import config from './config/config';
import { User } from './auth/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { ResetToken } from './auth/entities/reset-token.entity';
import { Employee } from './employees/entities/employee.entity';
import { Department } from './departments/entities/department.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [User, Role, RefreshToken, ResetToken, Employee, Department],
        synchronize: true, // Chỉ sử dụng trong môi trường phát triển
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolesModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}