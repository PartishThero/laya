// context/QueueContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  createQueueState,
  addToUserQueue,
  setContextQueue,
  removeFromUserQueue,
  reorderUserQueue,
  getNextTrack,
  getPrevTrack
} from '@/models/queue.model.js';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queueState, setQueueState] = useState(() => createQueueState());

  const queueCard = useCallback((cardOrCards) => {
    setQueueState(prev => addToUserQueue(prev, cardOrCards));
  }, []);

  const setContext = useCallback((cards, startIndex = 0) => {
    setQueueState(prev => setContextQueue(prev, cards, startIndex));
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueueState(prev => removeFromUserQueue(prev, index));
  }, []);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueueState(prev => reorderUserQueue(prev, fromIndex, toIndex));
  }, []);

  const clearUserQueue = useCallback(() => {
    setQueueState(prev => ({ ...prev, userQueue: [] }));
  }, []);

  const advanceNext = useCallback(() => {
    let nextTrack = null;
    setQueueState(prev => {
      const res = getNextTrack(prev);
      nextTrack = res.track;
      return res.nextState;
    });
    return nextTrack;
  }, []);

  const advancePrev = useCallback((current) => {
    let prevTrack = null;
    setQueueState(prev => {
      const res = getPrevTrack(prev, current);
      prevTrack = res.track;
      return res.nextState;
    });
    return prevTrack;
  }, []);

  return (
    <QueueContext.Provider
      value={{
        queueState,
        userQueue: queueState.userQueue,
        context: queueState.context,
        queueCard,
        setContext,
        removeFromQueue,
        reorderQueue,
        clearUserQueue,
        advanceNext,
        advancePrev
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
}
