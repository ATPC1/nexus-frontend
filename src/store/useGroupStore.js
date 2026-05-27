import { create } from 'zustand';
import api from '../services/api';

const useGroupStore = create((set) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/groups/my-groups');
      set({ groups: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch groups', loading: false });
    }
  },

  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/groups/create', groupData);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create group', loading: false });
      return false;
    }
  },

  joinGroup: async (groupCode) => {
    set({ loading: true, error: null });
    try {
      await api.post('/groups/join', { groupCode });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to join group', loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));

export default useGroupStore;
