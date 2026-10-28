import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAiTrackerStore = create(
    persist(
        (set, get) => ({
            tasks: [],
            
            startTask: (taskData) => {
                const newTask = {
                    ...taskData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    status: 'in-progress',
                    currentStep: 0,
                    chatHistory: {} // stepIndex -> chat messages
                };
                set({ tasks: [newTask, ...get().tasks] });
                return newTask;
            },

            completeStep: (taskId, stepIndex) => set(state => ({
                tasks: state.tasks.map(t => {
                    if (t.id === taskId) {
                        const newCurrent = stepIndex + 1;
                        const isFinished = newCurrent >= (t.stepsInfo?.length || 0);
                        return {
                            ...t,
                            currentStep: newCurrent,
                            status: isFinished ? 'completed' : 'in-progress'
                        };
                    }
                    return t;
                })
            })),

            addChatMessage: (taskId, stepIndex, message) => set(state => ({
                tasks: state.tasks.map(t => {
                    if (t.id === taskId) {
                        const currentChat = t.chatHistory[stepIndex] || [];
                        return {
                            ...t,
                            chatHistory: {
                                ...t.chatHistory,
                                [stepIndex]: [...currentChat, message]
                            }
                        };
                    }
                    return t;
                })
            }))
        }),
        {
            name: 'farm2value-ai-tracker'
        }
    )
);

export default useAiTrackerStore;
