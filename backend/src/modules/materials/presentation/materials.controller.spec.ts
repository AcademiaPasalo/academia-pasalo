import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

const mockMaterialsService = {
  uploadMaterial: jest.fn(),
  createFolder: jest.fn(),
  getRootFolders: jest.fn(),
  getFolderContents: jest.fn(),
  addVersion: jest.fn(),
  download: jest.fn(),
  requestDeletion: jest.fn(),
};

describe('MaterialsController RBAC Security', () => {
  let materialsController: MaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
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
  });

  describe('Upload & Creation Endpoints (Admin/Professor)', () => {
    it('endpoint "upload" should restrict access to ADMIN, PROFESSOR, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata('roles', materialsController.upload);
      expect(roles).toBeDefined();
      expect(roles).toContain('PROFESSOR');
      expect(roles).toContain('ADMIN');
      expect(roles).not.toContain('STUDENT');
    });

    it('endpoint "createFolder" should restrict access to ADMIN, PROFESSOR, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata(
        'roles',
        materialsController.createFolder,
      );
      expect(roles).toBeDefined();
      expect(roles).toContain('PROFESSOR');
      expect(roles).toContain('ADMIN');
      expect(roles).not.toContain('STUDENT');
    });

    it('endpoint "addVersion" should restrict access to ADMIN, PROFESSOR, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata(
        'roles',
        materialsController.addVersion,
      );
      expect(roles).toContain('PROFESSOR');
      expect(roles).not.toContain('STUDENT');
    });

    it('endpoint "requestDeletion" should restrict access to PROFESSOR, ADMIN, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata(
        'roles',
        materialsController.requestDeletion,
      );
      expect(roles).toContain('PROFESSOR');
      expect(roles).not.toContain('STUDENT');
    });
  });

  describe('Read Endpoints (All Roles)', () => {
    it('endpoint "getRootFolders" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata(
        'roles',
        materialsController.getRootFolders,
      );
      expect(roles).toContain('STUDENT');
    });

    it('endpoint "getFolderContents" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata(
        'roles',
        materialsController.getFolderContents,
      );
      expect(roles).toContain('STUDENT');
    });

    it('endpoint "download" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata('roles', materialsController.download);
      expect(roles).toContain('STUDENT');
    });
  });
});
