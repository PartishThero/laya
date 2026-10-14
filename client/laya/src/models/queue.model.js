// models/queue.model.js
// Handles dual queue: userQueue (dragged items, played first) + context (clicked album/playlist/catalogue)

export function createQueueState(initial = {}) {
  return {
    context: initial.context || [], // Array of card objects
    contextIndex: initial.contextIndex || 0,
    userQueue: initial.userQueue || [], // Array of card objects dragged into queue
    history: initial.history || []
  };
}

export function addToUserQueue(state, cardOrCards) {
  const cardsToAdd = Array.isArray(cardOrCards) ? cardOrCards : [cardOrCards];
  return {
    ...state,
    userQueue: [...state.userQueue, ...cardsToAdd]
  };
}

export function setContextQueue(state, cards, startIndex = 0) {
  return {
    ...state,
    context: cards,
    contextIndex: startIndex
  };
}

export function removeFromUserQueue(state, index) {
  const updated = [...state.userQueue];
  updated.splice(index, 1);
  return {
    ...state,
    userQueue: updated
  };
}

export function reorderUserQueue(state, fromIndex, toIndex) {
  if (fromIndex === toIndex) return state;
  const updated = [...state.userQueue];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return {
    ...state,
    userQueue: updated
  };
}

export function getNextTrack(state) {
  if (state.userQueue.length > 0) {
    const nextCard = state.userQueue[0];
    const nextState = {
      ...state,
      userQueue: state.userQueue.slice(1),
      history: [nextCard, ...state.history].slice(0, 50)
    };
    return { track: nextCard, nextState };
  }

  if (state.context.length > 0 && state.contextIndex + 1 < state.context.length) {
    const nextIndex = state.contextIndex + 1;
    const nextCard = state.context[nextIndex];
    const nextState = {
      ...state,
      contextIndex: nextIndex,
      history: [nextCard, ...state.history].slice(0, 50)
    };
    return { track: nextCard, nextState };
  }

  return { track: null, nextState: state };
}

export function getPrevTrack(state, currentTrack = null) {
  if (state.history.length > 0) {
    const prevCard = state.history[0];
    const nextState = {
      ...state,
      history: state.history.slice(1)
    };
    return { track: prevCard, nextState };
  }

  if (state.context.length > 0 && state.contextIndex > 0) {
    const prevIndex = state.contextIndex - 1;
    const prevCard = state.context[prevIndex];
    const nextState = {
      ...state,
      contextIndex: prevIndex
    };
    return { track: prevCard, nextState };
  }

  return { track: currentTrack, nextState: state };
}
