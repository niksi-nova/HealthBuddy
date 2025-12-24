import { create } from 'zustand';

const useFamilyStore = create((set) => ({
    members: [],
    admin: null,
    selectedMember: null,

    setMembers: (members) => set({ members }),
    setAdmin: (admin) => set({ admin }),

    addMember: (member) => set((state) => ({
        members: [...state.members, member]
    })),

    updateMember: (id, updates) => set((state) => ({
        members: state.members.map(m =>
            m._id === id ? { ...m, ...updates } : m
        )
    })),

    deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m._id !== id)
    })),

    setSelectedMember: (member) => set({ selectedMember: member }),
}));

export default useFamilyStore;
