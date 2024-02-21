import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

describe('RoleController', () => {
  let roleController: RoleController;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [TypeOrmModule.forFeature([Role])],
      controllers: [RoleController],
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Role,
        },
      ],
    }).compile();

    roleController = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(roleController).toBeDefined();
    expect(roleService).toBeDefined(); // Ensure RoleService is also defined
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'CTO',
        description: 'Chief Technology Officer',
      };

      const expectedResult = {
        id: 1,
        name: 'CEO',
        description: 'Chief Technology Officer',
        parent_id: null,
        parent: null,
        children: [],
      };

      jest.spyOn(roleService, 'create').mockResolvedValue(expectedResult);

      const result = await roleController.create(createRoleDto);

      expect(result).toBe(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      // Mock the roleService.findAll method and test accordingly
      const expectedResult: Role[] = [
        {
          id: 1,
          name: 'CEO',
          description: 'Chief Technology Officer',
          parent_id: null,
          parent: null,
          children: [],
        },
      ];
      await jest
        .spyOn(roleService, 'findAll')
        .mockResolvedValue(expectedResult);

      const result = await roleController.findAll();

      expect(result).toBe(expectedResult);
    });
  });

  describe('findAllByHierarchy', () => {
    it('should return roles by hierarchy', async () => {
      // Mock the roleService.getRoleHierarchy method and test accordingly
      const expectedResult = {
        id: 1,
        name: 'CEO',
        children: [],
      };
      jest
        .spyOn(roleService, 'getRoleHierarchy')
        .mockResolvedValue(expectedResult);

      const result = await roleController.findAllByHierarchy();

      expect(result).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a role by ID', async () => {
      // Mock the roleService.findOne method and test accordingly
      const roleId = 1;
      const expectedResult = {
        id: 1,
        name: 'CEO',
        description: 'Chief Technology Officer',
        parent_id: null,
        parent: null,
        children: [],
      };

      // Return a Promise that resolves to the expected result
      jest.spyOn(roleService, 'findOne').mockResolvedValue(expectedResult);

      const result = await roleController.findOne(roleId + '');

      expect(result).toBe(expectedResult);
    });
  });

  describe('findChildrensByARole', () => {
    it('should return children roles by a parent role ID', async () => {
      // Mock the roleService.findAllChildrensOfARole method and test accordingly
      const roleId = 1;
      const expectedResult = [];
      jest
        .spyOn(roleService, 'findAllChildrensOfARole')
        .mockResolvedValue(expectedResult);

      const result = await roleController.findChildrensByARole(roleId + '');

      expect(result).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a role by ID', async () => {
      // Mock the roleService.update method and test accordingly
      const roleId = 1; /* Define the role ID */
      const updateRoleDto: UpdateRoleDto = {
        name: 'CEO Perago',
        description: 'Cheife Financial Officer Perago',
      };
      const expectedResult = {
        id: 1,
        name: 'CEO Perago',
        description: 'Cheife Financial Officer Perago',
        parent_id: null,
        parent: null,
        children: [],
      };
      jest.spyOn(roleService, 'update').mockResolvedValue(expectedResult);

      const result = await roleController.update(String(roleId), updateRoleDto);

      expect(result).toBe(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a role by ID', async () => {
      // Mock the roleService.remove method and test accordingly
      const roleId = 1;
      const expectedResult = {
        id: 1,
        name: 'CEO Perago',
        description: 'Cheife Financial Officer Perago',
        parent_id: null,
        parent: null,
        children: [],
      };
      jest.spyOn(roleService, 'remove').mockResolvedValue(expectedResult);

      const result = await roleController.remove(String(roleId));

      expect(result).toBe(expectedResult);
    });
  });

  // describe('removeTransfer', () => {
  //   it('should remove and transfer a role by ID', async () => {
  //     // Mock the roleService.transferRemove method and test accordingly
  //     const roleId = /* Define the role ID */;
  //     const expectedResult = /* Define the expected result */;
  //     jest.spyOn(roleService, 'transferRemove').mockResolvedValue(expectedResult);

  //     const result = await roleController.removeTransfer(roleId);

  //     expect(result).toBe(expectedResult);
  //   });
  // });
});
