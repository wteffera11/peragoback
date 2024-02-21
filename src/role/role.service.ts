import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  async isRoot(id: number) {
    const rool = await this.roleRepo.findOne({ where: { id } });
    if (rool.parent_id) return false;
    else return true;
  }
  constructor(@InjectRepository(Role) readonly roleRepo: Repository<Role>) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      if (createRoleDto.parentId) {
        //check if there is a root role
        const hasRoot = this.hasRootRole();

        if (!hasRoot) {
          throw new Error('A root Role Must exist before creating Child Role');
        }

        const child = this.roleRepo.create({
          name: createRoleDto.name,
          description: createRoleDto.description,
        });

        const parent = await this.roleRepo.findOne({
          where: { id: createRoleDto.parentId },
        });

        if (!parent) {
          throw new Error(
            `Parent Role with Id ${createRoleDto.parentId} does not exist`,
          );
        }

        child.parent = parent;
        const savedChild = await this.roleRepo.save(child);

        // Manually serialize the response to avoid circular references
        return {
          id: savedChild.id,
          name: savedChild.name,
          description: savedChild.description,
          parentId: savedChild.parent ? savedChild.parent.id : null,
          // Add other properties as needed
        };
      } else {
        const hasRoot = await this.hasRootRole();
        if (hasRoot) {
          throw new Error(`Only one root role is allowed`);
        }

        const root = await this.roleRepo.create({
          name: createRoleDto.name,
          description: createRoleDto.description,
        });

        return this.roleRepo.save(root);
      }
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          `Role already exist with the name ${createRoleDto.name}`,
          409,
        );
      } else {
        return error;
      }
    }
  }

  //Checkig if there is a root role saved in the repo
  async hasRootRole(): Promise<boolean> {
    const rootRole = await this.roleRepo.findOne({ where: { parent: null } });
    return !!rootRole;
  }

  findAll() {
    return this.roleRepo.find({ relations: ['children'] });
  }

  async findAllChildrensOfARole(id: number): Promise<Role[]> {
    const childrens: Role[] = await this.roleRepo.find({
      where: { parent: { id } },
    });

    return childrens;
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    role.children = await this.roleRepo.find({
      where: { parent: { id: role.id } },
    });

    return role;
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role | Error> {
    try {
      const { name, description } = updateRoleDto;

      // Check if the role exists
      const role = await this.roleRepo.findOne({ where: { id } });
      const parent = await this.roleRepo.findOne({
        where: { id: Number(updateRoleDto.parentId) },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      // Update the role properties
      role.name = name;
      role.description = description;
      role.parent = parent;

      // Save the updated role
      return await this.roleRepo.save(role);
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          `Role already exist with the name ${updateRoleDto.name}`,
          409,
        );
      } else {
        return error;
      }
    }
  }

  async remove(id: number) {
    const roleToRemove = await this.roleRepo.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!roleToRemove) {
      throw new Error(`Role with id ${id} does not exist`);
    }

    if (roleToRemove.children && roleToRemove.children.length > 0) {
      throw new HttpException(
        'Can not delete a role with children(s)',
        HttpStatus.CONFLICT,
      );
    }

    const parentRole = roleToRemove.parent;

    // Remove the parent role from its parent's children
    if (parentRole) {
      parentRole.children = parentRole.children.filter(
        (child) => child.id != id,
      );
      await this.roleRepo.save(parentRole);
    }

    await this.roleRepo.delete(id);

    return roleToRemove;
  }

  async getRoleHierarchy() {
    const rootRole = await this.roleRepo.findOne({ where: { parent: null } });
    const roleTree = await this.buildRoleTree(rootRole);

    return roleTree;
  }

  private async buildRoleTree(role: Role): Promise<any> {
    const children = await this.roleRepo.find({ where: { parent: role } });
    if (children.length === 0) {
      return {
        id: role.id,
        name: role.name,
        children: [],
      };
    } else {
      const childNodes = [];

      for (const child of children) {
        const childNode = await this.buildRoleTree(child);
        childNodes.push(childNode);
      }

      return {
        id: role.id,
        name: role.name,
        children: childNodes,
      };
    }
  }
}
