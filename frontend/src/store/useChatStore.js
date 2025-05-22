import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  typingTimeout: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // Mark unread messages as read
      const unreadMessages = res.data.filter(
        (msg) => !msg.read && msg.senderId === userId
      );

      unreadMessages.forEach((msg) => {
        get().markMessageAsRead(msg._id);
      });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      // Stop typing indicator when sending a message
      get().stopTyping();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      await axiosInstance.put(`/messages/read/${messageId}`);
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        ),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },

  setIsTyping: (isTyping) => {
    set({ isTyping });
  },

  startTyping: () => {
    const { selectedUser, typingTimeout } = get();
    const socket = useAuthStore.getState().socket;

    if (typingTimeout) clearTimeout(typingTimeout);

    if (selectedUser && socket) {
      socket.emit("typing", { receiverId: selectedUser._id });

      const timeout = setTimeout(() => {
        get().stopTyping();
      }, 3000);

      set({ typingTimeout: timeout });
    }
  },

  stopTyping: () => {
    const { selectedUser, typingTimeout } = get();
    const socket = useAuthStore.getState().socket;

    if (typingTimeout) clearTimeout(typingTimeout);

    if (selectedUser && socket) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    set({ typingTimeout: null });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });

      // Automatically mark received messages as read
      get().markMessageAsRead(newMessage._id);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: false });
      }
    });

    socket.on("messageRead", ({ messageId }) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messageRead");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
