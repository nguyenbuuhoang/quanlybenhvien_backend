import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dtos/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private departmentRepository: Repository<Department>,
  ) {}

  async getAllDepartments() {
    const departments = await this.departmentRepository.find({
      relations: ['employees'],
    });
    
    return {
      success: true,
      message: 'Departments retrieved successfully',
      data: departments,
    };
  }

  async getDepartmentById(id: string) {
    const departmentId = parseInt(id);
    if (isNaN(departmentId)) throw new BadRequestException('Invalid department id');
    
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return {
      success: true,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  async createDepartment(createDepartmentData: CreateDepartmentDto) {
    const { name } = createDepartmentData;

    // Kiểm tra tên department đã tồn tại chưa
    const nameInUse = await this.departmentRepository.findOne({ where: { name } });
    if (nameInUse) {
      throw new BadRequestException('Department name already in use');
    }

    // Tạo department mới
    const department = this.departmentRepository.create(createDepartmentData);
    const savedDepartment = await this.departmentRepository.save(department);

    return {
      success: true,
      message: 'Department created successfully',
      data: savedDepartment,
    };
  }

  async updateDepartment(id: string, updateDepartmentData: UpdateDepartmentDto) {
    const departmentId = parseInt(id);
    if (isNaN(departmentId)) throw new BadRequestException('Invalid department id');
    
    const department = await this.departmentRepository.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const { name } = updateDepartmentData;

    // Kiểm tra tên mới có bị trùng không
    if (name && name !== department.name) {
      const nameInUse = await this.departmentRepository.findOne({ where: { name } });
      if (nameInUse) {
        throw new BadRequestException('Department name already in use');
      }
    }

    // Cập nhật department
    Object.assign(department, updateDepartmentData);
    const savedDepartment = await this.departmentRepository.save(department);

    return {
      success: true,
      message: 'Department updated successfully',
      data: savedDepartment,
    };
  }

  async deleteDepartment(id: string) {
    const departmentId = parseInt(id);
    if (isNaN(departmentId)) throw new BadRequestException('Invalid department id');
    
    const department = await this.departmentRepository.findOne({ 
      where: { id: departmentId },
      relations: ['employees']
    });
    
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Kiểm tra xem có employee nào trong department không
    if (department.employees && department.employees.length > 0) {
      throw new BadRequestException('Cannot delete department with existing employees');
    }

    await this.departmentRepository.remove(department);

    return {
      success: true,
      message: 'Department deleted successfully',
    };
  }
}
