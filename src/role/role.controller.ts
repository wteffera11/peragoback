import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get('/hierarchy')
  async findAllByHierarchy() {
    const hierarchy = await this.roleService.getRoleHierarchy();
    return hierarchy;
  }

  @Get('/isRoot/:id')
  async IsRoot(@Param('id') id: number) {
    const hierarchy = await this.roleService.isRoot(id);
    return hierarchy;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }
  @Get(':id/childrens')
  findChildrensByARole(@Param('id') id: string) {
    return this.roleService.findAllChildrensOfARole(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
