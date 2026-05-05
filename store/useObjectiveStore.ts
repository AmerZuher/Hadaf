import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { Objective, Todo, Status } from './types';

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

      deleteObjective: (id) => {
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

      deleteTodo: (id) => {
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
    }),
    {
      name: 'hadaf-objective-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
