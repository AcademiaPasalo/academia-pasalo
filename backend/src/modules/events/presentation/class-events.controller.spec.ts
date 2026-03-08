import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ClassEventsController } from '@modules/events/presentation/class-events.controller';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventsQueryService } from '@modules/events/application/class-events-query.service';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

const mockClassEventsService = {
  getAuthorizedRecordingLink: jest.fn(),
  getEventsByEvaluation: jest.fn(),
  calculateEventStatus: jest.fn(),
  getEventAccess: jest.fn(),
};

const mockClassEventsQueryService = {
  getMySchedule: jest.fn(),
  getDiscoveryLayers: jest.fn(),
  getGlobalSessions: jest.fn(),
};

describe('ClassEventsController RBAC', () => {
  let controller: ClassEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassEventsController],
      providers: [
        {
          provide: ClassEventsService,
          useValue: mockClassEventsService,
        },
        {
          provide: ClassEventsQueryService,
          useValue: mockClassEventsQueryService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<ClassEventsController>(ClassEventsController);
  });

  it('endpoint "getAuthorizedRecordingLink" should allow STUDENT role', () => {
    const roles = Reflect.getMetadata(
      'roles',
      controller.getAuthorizedRecordingLink,
    );
    expect(roles).toContain(ROLE_CODES.STUDENT);
    expect(roles).toContain(ROLE_CODES.PROFESSOR);
    expect(roles).toContain(ROLE_CODES.ADMIN);
    expect(roles).toContain(ROLE_CODES.SUPER_ADMIN);
  });
});
