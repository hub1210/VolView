export function watchStore(publicAPI, store, getter, cmp) {
  let cached = getter();
  const unsubscribe = store.$subscribe(() => {
    const val = getter();
    if (cmp ? cmp(cached, val) : cached !== val) {
      cached = val;
      publicAPI.modified();
    }
  });

  const originalDelete = publicAPI.delete;
  publicAPI.delete = () => {
    unsubscribe();
    originalDelete();
  };
}

export function watchState(publicAPI, state, callback) {
  let subscription = state.onModified(callback);
  const originalDelete = publicAPI.delete;
  publicAPI.delete = () => {
    subscription.unsubscribe();
    subscription = null;
    originalDelete();
  };
}

export const computeWorldCoords = (model) => (event) => {
  const manipulator =
    model.activeState?.getManipulator?.() ?? model.manipulator;
  if (!manipulator) {
    console.error('No manipulator');
    return undefined;
  }
  const { worldCoords } = manipulator.handleEvent(
    event,
    model._apiSpecificRenderWindow
  );
  if (!worldCoords)
    console.warn('Event cannot be converted to world coordinates');
  return worldCoords;
};
