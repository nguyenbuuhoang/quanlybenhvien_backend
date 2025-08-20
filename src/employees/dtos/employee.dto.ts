import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { Position } from '../enums/position.enum';
import { EmployeeStatus } from '../enums/employee-status.enum';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  birthDate?: string; // yyyy-MM-dd

  @IsEnum(Position)
  position: Position;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  birthDate?: string; // yyyy-MM-dd

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
