import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dtos/role.dto';
import { Resource } from './enums/resource.enum';
import { Action } from './enums/action.enum';


@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  //Tạo Role Admin mặc định
/*   @Post('_create-admin')
  async createAdminRole() {
    return this.rolesService.createAdminRole();
  } */
  @UseGuards(AuthenticationGuard)
  @Post()
  async createRole(@Body() role: CreateRoleDto) {
    return this.rolesService.createRole(role);
  }

  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('resources')
  getResources() {
    return Object.values(Resource);
  }

  @Get('actions')
  getActions() {
    return Object.values(Action);
  }
  
  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() update: UpdateRoleDto) {
    return this.rolesService.updateRole(id, update);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
