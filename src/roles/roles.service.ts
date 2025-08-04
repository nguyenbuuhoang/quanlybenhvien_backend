// ...existing code...
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dtos/role.dto';

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
}
