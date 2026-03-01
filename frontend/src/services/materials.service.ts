// ============================================
// MATERIALS SERVICE - Gestión de Materiales
// ============================================

import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/storage";
import type { ClassEventMaterial } from "@/types/material";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const materialsService = {
  /**
   * Obtener materiales de una sesión de clase
   */
  async getClassEventMaterials(
    classEventId: string,
  ): Promise<ClassEventMaterial[]> {
    const response = await apiClient.get<ClassEventMaterial[]>(
      `/materials/class-event/${classEventId}`,
    );
    return response.data;
  },

  /**
   * Descargar un material (respuesta binaria, no JSON)
   * Usa fetch directo con Bearer token para manejar el stream
   */
  async downloadMaterial(
    materialId: string,
    fileName: string,
  ): Promise<void> {
    const token = getAccessToken();
    const response = await fetch(
      `${API_BASE_URL}/materials/${materialId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al descargar el material");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
