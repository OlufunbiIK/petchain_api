import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('rbac-example')
export class RbacExampleController {
  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  getAdminData() {
    return { message: 'Only Admins can see this' };
  }

  @Get('owner')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Owner')
  getOwnerData() {
    return { message: 'Only Owners can see this' };
  }

  @Get('vet')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Vet')
  getVetData() {
    return { message: 'Only Vets can see this' };
  }
}
