import { notifyChange } from '../changes';
import type { SqlDatabase } from '../db/types';
import { newId, nowIso } from '../ids';
import type { Attachment } from '../models';

/** Limite por arquivo, para manter o banco e os backups em tamanho razoável. */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export class AttachmentTooLargeError extends Error {}

/**
 * Arquivos da ficha (exames, fotos, PDFs). O conteúdo fica no próprio banco
 * (base64), o que funciona igual no celular e no navegador e entra
 * automaticamente no backup.
 */
export function attachmentsRepository(db: SqlDatabase) {
  return {
    listByPatient(patientId: string): Promise<Attachment[]> {
      return db.getAllAsync<Attachment>(
        `SELECT id, patient_id, name, mime_type, size_bytes, created_at
         FROM attachments WHERE patient_id = ? ORDER BY created_at DESC`,
        [patientId],
      );
    },

    content(id: string): Promise<{ name: string; mime_type: string | null; content_base64: string } | null> {
      return db.getFirstAsync('SELECT name, mime_type, content_base64 FROM attachments WHERE id = ?', [id]);
    },

    async create(input: { patient_id: string; name: string; mime_type: string | null; size_bytes: number; content_base64: string }): Promise<string> {
      if (input.size_bytes > MAX_ATTACHMENT_BYTES) {
        throw new AttachmentTooLargeError('Arquivo maior que 10 MB.');
      }

      const id = newId();
      await db.runAsync(
        `INSERT INTO attachments (id, patient_id, name, mime_type, size_bytes, content_base64, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, input.patient_id, input.name, input.mime_type, input.size_bytes, input.content_base64, nowIso()],
      );
      notifyChange('attachments');
      return id;
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM attachments WHERE id = ?', [id]);
      notifyChange('attachments');
    },
  };
}
