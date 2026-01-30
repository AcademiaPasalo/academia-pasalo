import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from '@modules/feedback/application/feedback.service';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

// Mock simple
const mockFeedbackService = {
  createTestimony: jest.fn(),
  featureTestimony: jest.fn(),
  getPublicTestimonies: jest.fn(),
  getAllTestimoniesAdmin: jest.fn(),
};

describe('FeedbackController RBAC Security', () => {
  let controller: FeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        { provide: FeedbackService, useValue: mockFeedbackService },
        Reflector,
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<FeedbackController>(FeedbackController);
  });

  it('endpoint "create" should be restricted to STUDENT only', () => {
    const roles = Reflect.getMetadata('roles', controller.create);
    expect(roles).toBeDefined();
    expect(roles).toContain('STUDENT');
    expect(roles).not.toContain('ADMIN'); // Admin no opina
    expect(roles).not.toContain('PROFESSOR'); // Profesor no opina
  });

  it('endpoint "feature" should be restricted to ADMIN, SUPER_ADMIN', () => {
    const roles = Reflect.getMetadata('roles', controller.feature);
    expect(roles).toBeDefined();
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('SUPER_ADMIN');
    expect(roles).not.toContain('STUDENT'); // Alumno no modera
  });

  it('endpoint "getAdmin" should be restricted to ADMIN, SUPER_ADMIN', () => {
    const roles = Reflect.getMetadata('roles', controller.getAdmin);
    expect(roles).toContain('ADMIN');
    expect(roles).not.toContain('STUDENT');
  });

  it('endpoint "getPublic" should NOT have Role restrictions (Public Access)', () => {
    const roles = Reflect.getMetadata('roles', controller.getPublic);
    // Puede ser undefined (si es público total) o tener decorador Public()
    // En este caso, al no tener @Roles ni @Auth, debería ser accesible
    expect(roles).toBeUndefined();
  });
});
