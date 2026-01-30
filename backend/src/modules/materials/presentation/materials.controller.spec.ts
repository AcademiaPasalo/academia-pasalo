import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialFoldersController } from './material-folders.controller';
import { MaterialsService } from '../application/materials.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

// Mock del Servicio (ya probamos que funciona, ahora solo queremos ver si el controller lo llama o bloquea)
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
        Reflector, // Necesario para leer metadata de @Roles
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true }) // Bypass Auth básica, nos enfocamos en Roles
    .compile();

    materialsController = module.get<MaterialsController>(MaterialsController);
    foldersController = module.get<MaterialFoldersController>(MaterialFoldersController);
  });

  // Nota: En pruebas unitarias de NestJS, los Guards globales o de clase a veces requieren setup especial.
  // Sin embargo, podemos verificar la METADATA de los decoradores para asegurar que están configurados.
  // Es la forma más rápida y precisa de saber si la ruta está protegida sin levantar todo un servidor HTTP.

  describe('MaterialsController RBAC', () => {
    it('endpoint "upload" should restrict access to ADMIN, PROFESSOR, SUPER_ADMIN', () => {
      const roles = Reflect.getMetadata('roles', materialsController.upload);
      expect(roles).toBeDefined();
      expect(roles).toContain('PROFESSOR');
      expect(roles).toContain('ADMIN');
      expect(roles).not.toContain('STUDENT'); // CRÍTICO: Estudiante NO debe estar aquí
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
      expect(roles).not.toContain('STUDENT'); // CRÍTICO
    });

    it('endpoint "getRoots" should ALLOW STUDENT', () => {
      const roles = Reflect.getMetadata('roles', foldersController.getRoots);
      expect(roles).toContain('STUDENT'); // Estudiante SÍ puede leer
    });

    it('endpoint "getContents" should ALLOW STUDENT', () => {
        const roles = Reflect.getMetadata('roles', foldersController.getContents);
        expect(roles).toContain('STUDENT'); // Estudiante SÍ puede leer
      });
  });
});
