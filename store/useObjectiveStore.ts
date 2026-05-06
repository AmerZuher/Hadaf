import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { Objective, Todo, Status, FileAttachment } from './types';
import { saveAttachment } from '../utils/attachments';
import * as FileSystem from 'expo-file-system/legacy';



interface ObjectiveState {
  objectives: Objective[];
  todos: Todo[];
  addObjective: (name: string, categoryId: string) => void;
  updateObjective: (id: string, name: string, categoryId: string) => void;
  deleteObjective: (id: string) => void;
  addTodo: (objectiveId: string, todo: Omit<Todo, 'id' | 'objectiveId' | 'order' | 'isArchived'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  archiveTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  reorderTodos: (objectiveId: string, orderedTodoIds: string[]) => void;
  importTodos: (todos: Omit<Todo, 'id'>[]) => void;
  importObjective: (objective: Objective, todos: Todo[]) => void;
  appendBackup: (objectives: Objective[], todos: Todo[]) => void;
  addAttachment: (todoId: string, attachment: FileAttachment) => void;

  removeAttachment: (todoId: string, attachmentId: string) => void;
}

export const useObjectiveStore = create<ObjectiveState>()(
  persist(
    (set, get) => ({
      objectives: [],
      todos: [],

      addObjective: (name, categoryId) => {
        const newObj: Objective = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          categoryId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ objectives: [...state.objectives, newObj] }));
      },

      updateObjective: (id, name, categoryId) => {
        set((state) => ({
          objectives: state.objectives.map((obj) =>
            obj.id === id ? { ...obj, name, categoryId } : obj
          ),
        }));
      },

      deleteObjective: async (id) => {
        // 1. Get all todos for this objective to find their attachments
        const state = get();
        const todosToDelete = state.todos.filter((t) => t.objectiveId === id);

        // 2. Delete physical attachment folders
        for (const todo of todosToDelete) {
          const todoDir = `${FileSystem.documentDirectory}hadaf-attachments/${todo.id}/`;
          try {
            const info = await FileSystem.getInfoAsync(todoDir);
            if (info.exists) {
              await FileSystem.deleteAsync(todoDir, { idempotent: true });
            }
          } catch (error) {
            console.error(`Failed to delete attachments for todo ${todo.id}:`, error);
          }
        }

        // 3. Update state
        set((state) => ({
          objectives: state.objectives.filter((obj) => obj.id !== id),
          todos: state.todos.filter((t) => t.objectiveId !== id),
        }));
      },

      addTodo: (objectiveId, todo) => {
        set((state) => {
          const objectiveTodos = state.todos.filter((t) => t.objectiveId === objectiveId);
          const order = objectiveTodos.length;
          const newTodo: Todo = {
            ...todo,
            id: Math.random().toString(36).substring(2, 9),
            objectiveId,
            order,
            isArchived: false,
          };
          return { todos: [...state.todos, newTodo] };
        });
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
        }));
      },

      deleteTodo: async (id) => {
        // 1. Delete physical attachment folder
        const todoDir = `${FileSystem.documentDirectory}hadaf-attachments/${id}/`;
        try {
          const info = await FileSystem.getInfoAsync(todoDir);
          if (info.exists) {
            await FileSystem.deleteAsync(todoDir, { idempotent: true });
          }
        } catch (error) {
          console.error(`Failed to delete attachments for todo ${id}:`, error);
        }

        // 2. Update state
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      archiveTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, isArchived: true } : todo)),
        }));
      },

      restoreTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, isArchived: false } : todo)),
        }));
      },

      reorderTodos: (objectiveId, orderedTodoIds) => {
        set((state) => {
          const updatedTodos = state.todos.map((todo) => {
            if (todo.objectiveId === objectiveId) {
              const newOrder = orderedTodoIds.indexOf(todo.id);
              if (newOrder !== -1) {
                return { ...todo, order: newOrder };
              }
            }
            return todo;
          });
          return { todos: updatedTodos };
        });
      },

      importTodos: (newTodos) => {
        set((state) => {
          const formattedTodos = newTodos.map((t) => ({
            ...t,
            id: Math.random().toString(36).substring(2, 9),
            order: 0,
            isArchived: false,
          }));
          return { todos: [...state.todos, ...formattedTodos] };
        });
      },

      importObjective: (objective, todos) => {
        set((state) => ({
          objectives: [...state.objectives, objective],
          todos: [...state.todos, ...todos],
        }));
      },
      appendBackup: (objectives, todos) => {
        set((state) => ({
          objectives: [...state.objectives, ...objectives],
          todos: [...state.todos, ...todos],
        }));
      },



      addAttachment: async (todoId, attachment) => {
        try {
          // Move to persistent storage
          const persistentUri = await saveAttachment(attachment.uri, todoId, attachment.name);
          const persistentAttachment = { ...attachment, uri: persistentUri };

          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === todoId
                ? { ...todo, attachments: [...(todo.attachments ?? []), persistentAttachment] }
                : todo
            ),
          }));
        } catch (error) {
          console.error('Failed to add attachment to store:', error);
        }
      },


      removeAttachment: (todoId, attachmentId) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId
              ? { ...todo, attachments: (todo.attachments ?? []).filter((a) => a.id !== attachmentId) }
              : todo
          ),
        }));
      },
    }),
    {
      name: 'hadaf-objective-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
