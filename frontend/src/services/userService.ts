import api from "./api";
import { type UserSimple } from "./taskService";

export const userService = {
  /**
   * Fetches all registered users in the database.
   * Useful for dropdown menus during task assignment.
   */
  getUsers: async (): Promise<UserSimple[]> => {
    const res = await api.get<UserSimple[]>("/api/users");
    return res.data;
  },
};
