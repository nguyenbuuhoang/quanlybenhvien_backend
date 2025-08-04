import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { Permissions } from './decorators/permissions.decorator';
import { Resource } from './roles/enums/resource.enum';
import { Action } from './roles/enums/action.enum';
import { AuthorizationGuard } from './guards/authorization.guard';

@UseGuards(AuthenticationGuard, AuthorizationGuard)

@Controller('/products')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Permissions([{ resource: Resource.settings, actions: [Action.read] }]) // Phân quyền đọc cài đặt
  @Get()
  someProtectedRoute(@Req() req) {
    return {
      success: true,
      message: 'Accessed Resource successfully',
      data: {
        userId: req.userId,
        timestamp: new Date().toISOString(),
      },
    };
  }
}