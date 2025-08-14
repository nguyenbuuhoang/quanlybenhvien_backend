// ...existing code...
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from './dtos/role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

  async getRoleByName(name: string) {
    return this.roleRepository.findOne({ where: { name } });
  }

  async createRole(role: CreateRoleDto) {
//TODO: Kiểm tra tên vai trò phải là duy nhất
    const existingRole = await this.roleRepository.findOne({
      where: { name: role.name },
    });
    
    if (existingRole) {
      throw new BadRequestException('Role name already exists');
    }
    
      const newRole = this.roleRepository.create(role);
      if (role.description) {
        newRole.description = role.description;
      }
      const savedRole = await this.roleRepository.save(newRole);
    
    return {
      success: true,
      message: 'Role created successfully',
      data: savedRole,
    };
  }

  async getRoleById(roleId: string) {
    return this.roleRepository.findOne({ where: { id: parseInt(roleId) } });
  }

  async getAllRoles() {
    return this.roleRepository.find();
  }

  async updateRole(roleId: string, update: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id: parseInt(roleId) } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    if (update.name) {
      // Kiểm tra tên mới có bị trùng không
      const existingRole = await this.roleRepository.findOne({ where: { name: update.name } });
      if (existingRole && existingRole.id !== role.id) {
        throw new BadRequestException('Role name already exists');
      }
      role.name = update.name;
    }
      if (update.description !== undefined) {
        role.description = update.description;
      }
    if (update.permissions) {
      role.permissions = update.permissions;
    }
    const savedRole = await this.roleRepository.save(role);
    return {
      success: true,
      message: 'Role updated successfully',
      data: savedRole,
    };
  }
  async deleteRole(roleId: string) {
    const id = parseInt(roleId);
    if (isNaN(id)) throw new BadRequestException('Invalid role id');
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new BadRequestException('Role not found');
    await this.roleRepository.remove(role);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }
}
