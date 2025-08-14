import { Type } from 'class-transformer';
import {
    ArrayUnique,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => Permission)
  permissions: Permission[];
}

export class Permission {
  @IsEnum(Resource)
  resource: Resource;

  @IsEnum(Action, { each: true })
  @ArrayUnique()
  actions: Action[];
}

export class UpdateRoleDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => Permission)
  permissions?: Permission[];
}
