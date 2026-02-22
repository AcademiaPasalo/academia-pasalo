import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '@modules/materials/domain/material.entity';

export type AdminMaterialFileListParams = {
  page: number;
  pageSize: number;
  search?: string;
  statusCode?: string;
};

export type AdminMaterialFileListRow = {
  materialId: string;
  displayName: string;
  classEventId: string | null;
  visibleFrom: Date | null;
  visibleUntil: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  statusCode: string;
  statusName: string;
  folderId: string;
  folderName: string;
  evaluationId: string;
  evaluationNumber: number;
  evaluationTypeCode: string;
  evaluationTypeName: string;
  courseCode: string;
  courseName: string;
  academicCycleCode: string;
  fileResourceId: string;
  fileVersionId: string;
  versionNumber: number;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  storageProvider: string;
  createdById: string | null;
  createdByEmail: string | null;
  createdByFirstName: string | null;
  createdByLastName1: string | null;
  createdByLastName2: string | null;
};

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly ormRepository: Repository<Material>,
  ) {}

  async create(material: Partial<Material>): Promise<Material> {
    const newMaterial = this.ormRepository.create(material);
    return await this.ormRepository.save(newMaterial);
  }

  async findById(id: string): Promise<Material | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        fileResource: true,
        fileVersion: true,
      },
    });
  }

  async findByFolderId(
    folderId: string,
    materialStatusId?: string,
  ): Promise<Material[]> {
    return await this.ormRepository.find({
      where: materialStatusId
        ? { materialFolderId: folderId, materialStatusId }
        : { materialFolderId: folderId },
      relations: {
        fileResource: true,
        fileVersion: true,
      },
      order: { displayName: 'ASC' },
    });
  }

  async findByClassEventId(
    classEventId: string,
    materialStatusId?: string,
  ): Promise<Material[]> {
    return await this.ormRepository.find({
      where: materialStatusId
        ? { classEventId, materialStatusId }
        : { classEventId },
      relations: {
        fileResource: true,
        fileVersion: true,
      },
      order: { displayName: 'ASC' },
    });
  }

  async findAdminMaterialFilesPage(
    params: AdminMaterialFileListParams,
  ): Promise<{ rows: AdminMaterialFileListRow[]; totalItems: number }> {
    const page = Math.max(1, params.page);
    const pageSize = Math.max(1, params.pageSize);
    const search = params.search?.trim();
    const statusCode = params.statusCode?.trim().toUpperCase();

    const baseQb = this.ormRepository
      .createQueryBuilder('m')
      .innerJoin('m.materialFolder', 'mf')
      .innerJoin('m.materialStatus', 'ms')
      .innerJoin('m.fileVersion', 'fv')
      .innerJoin('m.fileResource', 'fr')
      .innerJoin('mf.evaluation', 'e')
      .innerJoin('e.evaluationType', 'et')
      .innerJoin('e.courseCycle', 'cc')
      .innerJoin('cc.course', 'c')
      .innerJoin('cc.academicCycle', 'ac')
      .leftJoin('m.createdBy', 'u');

    if (search) {
      baseQb.andWhere(
        '(m.displayName LIKE :search OR fr.originalName LIKE :search OR c.code LIKE :search OR c.name LIKE :search OR ac.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (statusCode) {
      baseQb.andWhere('ms.code = :statusCode', { statusCode });
    }

    const totalItems = await baseQb.getCount();

    const idsQb = this.ormRepository
      .createQueryBuilder('m')
      .innerJoin('m.materialFolder', 'mf')
      .innerJoin('m.materialStatus', 'ms')
      .innerJoin('m.fileResource', 'fr')
      .innerJoin('mf.evaluation', 'e')
      .innerJoin('e.courseCycle', 'cc')
      .innerJoin('cc.course', 'c')
      .innerJoin('cc.academicCycle', 'ac')
      .select('m.id', 'materialId')
      .orderBy('m.createdAt', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (search) {
      idsQb.andWhere(
        '(m.displayName LIKE :search OR fr.originalName LIKE :search OR c.code LIKE :search OR c.name LIKE :search OR ac.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (statusCode) {
      idsQb.andWhere('ms.code = :statusCode', { statusCode });
    }

    const idRows = await idsQb.getRawMany<{ materialId: string }>();
    const materialIds = idRows.map((row) => row.materialId);
    if (materialIds.length === 0) {
      return { rows: [], totalItems };
    }

    const rows = await this.ormRepository
      .createQueryBuilder('m')
      .innerJoin('m.materialFolder', 'mf')
      .innerJoin('m.materialStatus', 'ms')
      .innerJoin('m.fileVersion', 'fv')
      .innerJoin('m.fileResource', 'fr')
      .innerJoin('mf.evaluation', 'e')
      .innerJoin('e.evaluationType', 'et')
      .innerJoin('e.courseCycle', 'cc')
      .innerJoin('cc.course', 'c')
      .innerJoin('cc.academicCycle', 'ac')
      .leftJoin('m.createdBy', 'u')
      .where('m.id IN (:...materialIds)', { materialIds })
      .select('m.id', 'materialId')
      .addSelect('m.displayName', 'displayName')
      .addSelect('m.classEventId', 'classEventId')
      .addSelect('m.visibleFrom', 'visibleFrom')
      .addSelect('m.visibleUntil', 'visibleUntil')
      .addSelect('m.createdAt', 'createdAt')
      .addSelect('m.updatedAt', 'updatedAt')
      .addSelect('ms.code', 'statusCode')
      .addSelect('ms.name', 'statusName')
      .addSelect('mf.id', 'folderId')
      .addSelect('mf.name', 'folderName')
      .addSelect('e.id', 'evaluationId')
      .addSelect('e.number', 'evaluationNumber')
      .addSelect('et.code', 'evaluationTypeCode')
      .addSelect('et.name', 'evaluationTypeName')
      .addSelect('c.code', 'courseCode')
      .addSelect('c.name', 'courseName')
      .addSelect('ac.code', 'academicCycleCode')
      .addSelect('fr.id', 'fileResourceId')
      .addSelect('fv.id', 'fileVersionId')
      .addSelect('fv.versionNumber', 'versionNumber')
      .addSelect('fr.originalName', 'originalName')
      .addSelect('fr.mimeType', 'mimeType')
      .addSelect('fr.sizeBytes', 'sizeBytes')
      .addSelect('fr.storageProvider', 'storageProvider')
      .addSelect('u.id', 'createdById')
      .addSelect('u.email', 'createdByEmail')
      .addSelect('u.firstName', 'createdByFirstName')
      .addSelect('u.lastName1', 'createdByLastName1')
      .addSelect('u.lastName2', 'createdByLastName2')
      .getRawMany<AdminMaterialFileListRow>();

    const rowMap = new Map<string, AdminMaterialFileListRow>();
    for (const row of rows) {
      rowMap.set(row.materialId, row);
    }

    return {
      rows: materialIds
        .map((materialId) => rowMap.get(materialId))
        .filter((row): row is AdminMaterialFileListRow => !!row),
      totalItems,
    };
  }
}
