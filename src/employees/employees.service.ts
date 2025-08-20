import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    @InjectRepository(Department) private departmentRepository: Repository<Department>,
  ) {}

  async getAllEmployees() {
    const employees = await this.employeeRepository.find({
      relations: ['department'],
    });
    
    return {
      success: true,
      message: 'Employees retrieved successfully',
      data: employees,
    };
  }

  async getEmployeeById(id: string) {
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) throw new BadRequestException('Invalid employee id');
    
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['department'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return {
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }

  async createEmployee(createEmployeeData: CreateEmployeeDto) {
    const { email, departmentId } = createEmployeeData;

    // Kiểm tra email đã tồn tại chưa
    const emailInUse = await this.employeeRepository.findOne({ where: { email } });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Kiểm tra department có tồn tại không (nếu được cung cấp)
    if (departmentId) {
      const department = await this.departmentRepository.findOne({ where: { id: departmentId } });
      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    // Tạo employee mới
    const employee = this.employeeRepository.create(createEmployeeData);
    const savedEmployee = await this.employeeRepository.save(employee);

    return {
      success: true,
      message: 'Employee created successfully',
      data: savedEmployee,
    };
  }
  //Tạo nhiều Employees
/*   async createManyEmployees(employees: CreateEmployeeDto[]) {
    const results: any[] = [];
    for (const emp of employees) {
      try {
        // Kiểm tra email đã tồn tại chưa
        const emailInUse = await this.employeeRepository.findOne({ where: { email: emp.email } });
        if (emailInUse) {
          results.push({ success: false, message: 'Email already in use', data: emp });
          continue;
        }
        // Kiểm tra department có tồn tại không (nếu được cung cấp)
        if (emp.departmentId) {
          const department = await this.departmentRepository.findOne({ where: { id: emp.departmentId } });
          if (!department) {
            results.push({ success: false, message: 'Department not found', data: emp });
            continue;
          }
        }
        // Tạo employee mới
        const employee = this.employeeRepository.create(emp);
        const savedEmployee = await this.employeeRepository.save(employee);
        results.push({ success: true, message: 'Employee created', data: savedEmployee });
      } catch (error) {
        results.push({ success: false, message: error.message, data: emp });
      }
    }
    return { success: true, results };
  } */
  async updateEmployee(id: string, updateEmployeeData: UpdateEmployeeDto) {
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) throw new BadRequestException('Invalid employee id');
    
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const { email, departmentId } = updateEmployeeData;

    // Kiểm tra email mới có bị trùng không
    if (email && email !== employee.email) {
      const emailInUse = await this.employeeRepository.findOne({ where: { email } });
      if (emailInUse) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Kiểm tra department có tồn tại không (nếu được cung cấp)
    if (departmentId) {
      const department = await this.departmentRepository.findOne({ where: { id: departmentId } });
      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    // Cập nhật employee
    Object.assign(employee, updateEmployeeData);
    const savedEmployee = await this.employeeRepository.save(employee);

    return {
      success: true,
      message: 'Employee updated successfully',
      data: savedEmployee,
    };
  }

  async deleteEmployee(id: string) {
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) throw new BadRequestException('Invalid employee id');
    
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.remove(employee);

    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  }
}
