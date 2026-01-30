import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialFoldersController } from './material-folders.controller';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

const mockMaterialsService = {
  uploadMaterial: jest.fn(),
  createFolder: jest.fn(),
  getRootFolders: jest.fn(),
  getFolderContents: jest.fn(),
};

describe('Materials Controllers RBAC Security', () => {
  let materialsController: MaterialsController;
  let foldersController: MaterialFoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController, MaterialFoldersController],
      providers: [
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
        Reflector,
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    materialsController = module.get<MaterialsController>(MaterialsController);
    foldersController = module.get<MaterialFoldersController>(MaterialFoldersController);
  });

  describe('MaterialsController RBAC', () => {
    it('endpoint "upload" should restrict access to ADMIN, PROFESSOR, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata('roles', materialsController.upload);
      expect(roles).toBeDefined();
      expect(roles).toContain('PROFESSOR');
      expect(roles).toContain('ADMIN');
      expect(roles).not.toContain('STUDENT');
    });

    it('endpoint "requestDeletion" should restrict access to PROFESSOR, ADMIN, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata('roles', materialsController.requestDeletion);
      expect(roles).toContain('PROFESSOR');
      expect(roles).not.toContain('STUDENT');
    });
  });

  describe('MaterialFoldersController RBAC', () => {
    it('endpoint "create" (Folder) should restrict access to ADMIN, PROFESSOR', () => {
      const roles = Reflect.getMetadata('roles', foldersController.create);
      expect(roles).toBeDefined();
      expect(roles).toContain('PROFESSOR');
      expect(roles).not.toContain('STUDENT');
    });

    it('endpoint "getRoots" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata('roles', foldersController.getRoots);
      expect(roles).toContain('STUDENT');
    });

    it('endpoint "getContents" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata('roles', foldersController.getContents);
      expect(roles).toContain('STUDENT');
    });
  });
});
