import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';
import { Gender } from './enums/gender.enum';
import { Position } from './enums/position.enum';

@UseGuards(AuthenticationGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAllEmployees() {
    return this.employeesService.getAllEmployees();
  }

  @Get('genders')
  getGenders() {
    return Object.values(Gender);
  }
  @Get('positions')
  getPositions() {
    return Object.values(Position);
  }
  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }

  @Post()
  async createEmployee(@Body() createEmployeeData: CreateEmployeeDto) {
    return this.employeesService.createEmployee(createEmployeeData);
  }
  //Tạo nhiều Employees
/*   @Post('bulk')
  async createManyEmployees(@Body() employees: CreateEmployeeDto[]) {
    return this.employeesService.createManyEmployees(employees);
  } */
  @Put(':id')
  async updateEmployee(@Param('id') id: string, @Body() updateEmployeeData: UpdateEmployeeDto) {
    return this.employeesService.updateEmployee(id, updateEmployeeData);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    return this.employeesService.deleteEmployee(id);
  }
}
