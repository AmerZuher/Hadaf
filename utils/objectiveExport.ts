import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { format } from 'date-fns';
import JSZip from 'jszip';


import { z } from 'zod';
import { Objective, Todo, FileAttachment } from '../store/types';
import { saveAttachment } from './attachments';

// ─── Schemas for Validation ──────────────────────────────────────────────────

const AttachmentSchema = z.object({
  name: z.string(),
  uri: z.string(),
  mimeType: z.string(),
  size: z.number(),
  addedAt: z.string(),
});

const TodoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['done', 'in-progress', 'pending']),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  objectiveId: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
  isArchived: z.boolean(),

  order: z.number(),
  attachments: z.array(AttachmentSchema).optional(),
});

const ObjectiveExportSchema = z.object({
  version: z.literal(1),
  objective: z.object({
    name: z.string(),
    categoryId: z.string(),
    createdAt: z.string(),
  }),
  todos: z.array(TodoSchema),
});

const FullExportSchema = z.object({
  version: z.literal(1),
  objectives: z.array(z.object({
    id: z.string(),
    name: z.string(),
    categoryId: z.string(),
    createdAt: z.string(),
  })),
  todos: z.array(TodoSchema),
});

type ObjectiveExportData = z.infer<typeof ObjectiveExportSchema>;
type FullExportData = z.infer<typeof FullExportSchema>;



// ─── Utilities ───────────────────────────────────────────────────────────────

const TEMP_DIR = `${FileSystem.cacheDirectory}hadaf-exports/`;

const cleanup = async (path: string) => {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  } catch (e) {
    console.warn('Cleanup failed for:', path, e);
  }
};

const ensureDir = async (dir: string) => {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

/** Resolve name conflicts by appending (1), (2), etc. */
export const resolveNameConflict = (name: string, existingNames: string[]): string => {
  let newName = name;
  let counter = 1;
  const nameSet = new Set(existingNames);
  
  while (nameSet.has(newName)) {
    newName = `${name} (${counter})`;
    counter++;
  }
  return newName;
};

// ─── Export Logic ────────────────────────────────────────────────────────────

/** Generates a ZIP file in cache and returns its URI */
export const generateObjectiveZip = async (objective: Objective, todos: Todo[]): Promise<string> => {
  const timestamp = Date.now();
  const exportFolder = `${TEMP_DIR}export-${timestamp}/`;
  const zipFileUri = `${FileSystem.cacheDirectory}${objective.name.replace(/\s+/g, '_')}.zip`;

  try {
    await ensureDir(exportFolder);
    const zip = new JSZip();

    // 1. Prepare data.json
    const exportData: ObjectiveExportData = {
      version: 1,
      objective: {
        name: objective.name,
        categoryId: objective.categoryId,
        createdAt: objective.createdAt,
      },
      todos: todos.map(todo => ({
        ...todo,
        attachments: todo.attachments?.map(att => ({
          ...att,
          uri: `attachments/${todo.id}/${att.name}`
        }))
      }))
    };

    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // 2. Bundle attachments
    const attachmentsFolder = zip.folder('attachments');
    if (attachmentsFolder) {
      for (const todo of todos) {
        if (todo.attachments && todo.attachments.length > 0) {
          const todoFolder = attachmentsFolder.folder(todo.id);
          if (todoFolder) {
            for (const att of todo.attachments) {
              const fileInfo = await FileSystem.getInfoAsync(att.uri);
              if (fileInfo.exists) {
                const base64 = await FileSystem.readAsStringAsync(att.uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                todoFolder.file(att.name, base64, { base64: true });
              }
            }
          }
        }
      }
    }

    // 3. Generate ZIP
    const content = await zip.generateAsync({ type: 'base64' });
    await FileSystem.writeAsStringAsync(zipFileUri, content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return zipFileUri;

  } catch (error) {
    console.error('ZIP generation failed:', error);
    throw error;
  } finally {
    await cleanup(exportFolder);
  }
};

/** Shares the objective via system share sheet */
export const exportObjective = async (objective: Objective, todos: Todo[]) => {
  const zipFileUri = await generateObjectiveZip(objective, todos);
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(zipFileUri, {
        mimeType: 'application/zip',
        dialogTitle: `Export ${objective.name}`,
        UTI: 'public.zip-archive',
      });
    }
  } finally {
    await cleanup(zipFileUri);
  }
};


/** Generates a Full Backup ZIP in cache and returns its URI */
export const generateFullBackupZip = async (objectives: Objective[], todos: Todo[]): Promise<string> => {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const zipFileUri = `${FileSystem.cacheDirectory}hadaf_full_backup_${timestamp}.zip`;

  try {
    const zip = new JSZip();

    // 1. Prepare data.json
    const exportData: FullExportData = {
      version: 1,
      objectives: objectives.map(o => ({
        id: o.id,
        name: o.name,
        categoryId: o.categoryId,
        createdAt: o.createdAt,
      })),
      todos: todos.map(todo => ({
        ...todo,
        attachments: todo.attachments?.map(att => ({
          ...att,
          uri: `attachments/${todo.id}/${att.name}`
        }))
      }))
    };

    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // 2. Bundle all attachments
    const attachmentsFolder = zip.folder('attachments');
    if (attachmentsFolder) {
      for (const todo of todos) {
        if (todo.attachments && todo.attachments.length > 0) {
          const todoFolder = attachmentsFolder.folder(todo.id);
          if (todoFolder) {
            for (const att of todo.attachments) {
              const fileInfo = await FileSystem.getInfoAsync(att.uri);
              if (fileInfo.exists) {
                const base64 = await FileSystem.readAsStringAsync(att.uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                todoFolder.file(att.name, base64, { base64: true });
              }
            }
          }
        }
      }
    }

    const content = await zip.generateAsync({ type: 'base64' });
    await FileSystem.writeAsStringAsync(zipFileUri, content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return zipFileUri;
  } catch (error) {
    console.error('Full ZIP generation failed:', error);
    throw error;
  }
};



/** Save the ZIP to a user-picked location (Android SAF or iOS share) */
export const saveObjectiveToDevice = async (objective: Objective, todos: Todo[]) => {
  const zipFileUri = await generateObjectiveZip(objective, todos);
  
  try {
    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(zipFileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const fileName = `${objective.name.replace(/\s+/g, '_')}.zip`;
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/zip'
        );
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return true;
      }
    } else {
      // iOS "Save to Files" is handled by Sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipFileUri, {
          mimeType: 'application/zip',
          UTI: 'public.zip-archive',
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Save to device failed:', error);
    throw error;
  } finally {
    await cleanup(zipFileUri);
  }
};


/** Save the full app backup (JSON) to a user-picked location */
export const saveBackupToDevice = async (data: any) => {
  try {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const fileName = `hadaf_backup_${timestamp}.json`;
    const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(tempFileUri, JSON.stringify(data, null, 2));

    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/json'
        );
        const content = await FileSystem.readAsStringAsync(tempFileUri);
        await FileSystem.writeAsStringAsync(fileUri, content);
        return true;
      }
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFileUri);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Save backup failed:', error);
    throw error;
  } finally {
    // Cleanup temp file if needed
  }
};



// ─── Import Logic ────────────────────────────────────────────────────────────

export interface ImportPreview {
  name: string;
  todoCount: number;
  attachmentCount: number;
  data: ObjectiveExportData;
  zipUri: string;
}

export const parseImport = async (zipUri: string): Promise<ImportPreview> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(zipUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zip = await JSZip.loadAsync(base64, { base64: true });

    const dataFile = zip.file('data.json');
    if (!dataFile) throw new Error('Missing data.json in ZIP');

    const dataJson = await dataFile.async('string');
    const rawData = JSON.parse(dataJson);
    
    // Validate schema
    const validatedData = ObjectiveExportSchema.parse(rawData);

    const attachmentCount = validatedData.todos.reduce(
      (sum, todo) => sum + (todo.attachments?.length || 0), 0
    );

    return {
      name: validatedData.objective.name,
      todoCount: validatedData.todos.length,
      attachmentCount,
      data: validatedData,
      zipUri,
    };
  } catch (error) {
    console.error('Parse import failed:', error);
    throw error;
  }
};

export const confirmImport = async (
  preview: ImportPreview, 
  existingObjectiveNames: string[],
  onImport: (obj: Objective, todos: Todo[]) => void
) => {
  try {
    const { data, zipUri } = preview;
    const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zip = await JSZip.loadAsync(zipBase64, { base64: true });

    // 1. Resolve Name
    const finalName = resolveNameConflict(data.objective.name, existingObjectiveNames);
    const newObjectiveId = Math.random().toString(36).substring(2, 9);
    
    const newObjective: Objective = {
      id: newObjectiveId,
      name: finalName,
      categoryId: data.objective.categoryId,
      createdAt: data.objective.createdAt,
    };

    // 2. Remap Todos and Copy Attachments
    const newTodos: Todo[] = [];

    for (const todo of data.todos) {
      const newTodoId = Math.random().toString(36).substring(2, 9);
      const newAttachments: FileAttachment[] = [];

      if (todo.attachments) {
        for (const att of todo.attachments) {
          const zipPath = `attachments/${todo.id}/${att.name}`;
          const fileInZip = zip.file(zipPath);
          
          if (fileInZip) {
            const fileBase64 = await fileInZip.async('base64');
            const tempFileUri = `${FileSystem.cacheDirectory}${att.name}`;
            await FileSystem.writeAsStringAsync(tempFileUri, fileBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Move to permanent structured storage
            const persistentUri = await saveAttachment(tempFileUri, newTodoId, att.name);
            await cleanup(tempFileUri);

            newAttachments.push({
              id: Math.random().toString(36).substring(2, 9),
              name: att.name,
              uri: persistentUri,
              mimeType: att.mimeType,
              size: att.size,
              addedAt: att.addedAt,
            });
          }
        }
      }

      newTodos.push({
        ...todo,
        id: newTodoId,
        objectiveId: newObjectiveId,
        attachments: newAttachments,
      });
    }

    onImport(newObjective, newTodos);
  } catch (error) {
    console.error('Confirm import failed:', error);
    throw error;
  }
};

export const parseFullImport = async (zipUri: string): Promise<FullExportData> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(zipUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zip = await JSZip.loadAsync(base64, { base64: true });

    const dataFile = zip.file('data.json');
    if (!dataFile) throw new Error('Missing data.json in ZIP');

    const dataJson = await dataFile.async('string');
    const rawData = JSON.parse(dataJson);
    
    return FullExportSchema.parse(rawData);
  } catch (error) {
    console.error('Parse full import failed:', error);
    throw error;
  }
};

export const confirmFullImport = async (
  data: FullExportData,
  zipUri: string,
  existingObjectives: Objective[],
  onImport: (objectives: Objective[], todos: Todo[]) => void
) => {
  try {
    const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zip = await JSZip.loadAsync(zipBase64, { base64: true });

    const objectiveIdMap: Record<string, string> = {};
    const todoIdMap: Record<string, string> = {};
    
    const newObjectives: Objective[] = [];
    const newTodos: Todo[] = [];

    const existingNames = existingObjectives.map(o => o.name);

    // 1. Process Objectives
    for (const obj of data.objectives) {
      const newId = Math.random().toString(36).substring(2, 9);
      objectiveIdMap[obj.id] = newId;
      
      const finalName = resolveNameConflict(obj.name, existingNames);
      existingNames.push(finalName); // Keep track of names as we add

      newObjectives.push({
        ...obj,
        id: newId,
        name: finalName,
      });
    }

    // 2. Process Todos and Attachments
    for (const todo of data.todos) {
      const newTodoId = Math.random().toString(36).substring(2, 9);
      todoIdMap[todo.id] = newTodoId;
      
      const newAttachments: FileAttachment[] = [];
      
      if (todo.attachments) {
        for (const att of todo.attachments) {
          const zipPath = `attachments/${todo.id}/${att.name}`;
          const fileInZip = zip.file(zipPath);
          
          if (fileInZip) {
            const fileBase64 = await fileInZip.async('base64');
            const tempFileUri = `${FileSystem.cacheDirectory}${att.name}`;
            await FileSystem.writeAsStringAsync(tempFileUri, fileBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            const persistentUri = await saveAttachment(tempFileUri, newTodoId, att.name);
            await cleanup(tempFileUri);

            newAttachments.push({
              ...att,
              id: Math.random().toString(36).substring(2, 9),
              uri: persistentUri,
            });
          }
        }
      }

      newTodos.push({
        ...todo,
        id: newTodoId,
        objectiveId: objectiveIdMap[todo.objectiveId] || todo.objectiveId,
        attachments: newAttachments,
      });
    }

    onImport(newObjectives, newTodos);
  } catch (error) {
    console.error('Confirm full import failed:', error);
    throw error;
  }
};

