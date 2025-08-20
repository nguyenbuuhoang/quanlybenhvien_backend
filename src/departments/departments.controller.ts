import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dtos/department.dto';

@UseGuards(AuthenticationGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getAllDepartments() {
    return this.departmentsService.getAllDepartments();
  }

  @Get(':id')
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentsService.getDepartmentById(id);
  }

  @Post()
  async createDepartment(@Body() createDepartmentData: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(createDepartmentData);
  }

  @Put(':id')
  async updateDepartment(@Param('id') id: string, @Body() updateDepartmentData: UpdateDepartmentDto) {
    return this.departmentsService.updateDepartment(id, updateDepartmentData);
  }

  @Delete(':id')
  async deleteDepartment(@Param('id') id: string) {
    return this.departmentsService.deleteDepartment(id);
  }
}
