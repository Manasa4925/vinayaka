import api from "./api";

export interface UserSimple {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  due_date: string;
  assigned_user_id: number | null;
  created_at: string;
  assigned_user: UserSimple | null;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  due_date: string;
  assigned_user_id?: number | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  priority?: "Low" | "Medium" | "High";
  status?: "To Do" | "In Progress" | "Completed";
  due_date?: string;
  assigned_user_id?: number | null;
}

export const taskService = {
  /**
   * Fetches tasks.
   * - Admins get all tasks in the system.
   * - Standard users get only tasks assigned to them.
   */
  getTasks: async (): Promise<Task[]> => {
    const res = await api.get<Task[]>("/api/tasks");
    return res.data;
  },

  /**
   * Fetches details of a specific task.
   */
  getTask: async (id: number): Promise<Task> => {
    const res = await api.get<Task>(`/api/tasks/${id}`);
    return res.data;
  },

  /**
   * Creates a new task. Admin role is required by backend.
   */
  createTask: async (payload: TaskCreatePayload): Promise<Task> => {
    const res = await api.post<Task>("/api/tasks", payload);
    return res.data;
  },

  /**
   * Updates an existing task.
   * - Admins can update any field.
   * - Standard users can only update 'status'. (Backend will validate).
   */
  updateTask: async (id: number, payload: TaskUpdatePayload): Promise<Task> => {
    const res = await api.put<Task>(`/api/tasks/${id}`, payload);
    return res.data;
  },

  /**
   * Deletes a task. Admin role is required.
   */
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },
};
