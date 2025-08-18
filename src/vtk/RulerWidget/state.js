import macro from '@kitware/vtk.js/macros';
import bounds from '@kitware/vtk.js/Widgets/Core/StateBuilder/boundsMixin';
import vtkAnnotationWidgetState from '../ToolWidgetUtils/annotationWidgetState';

import createPointState from '../ToolWidgetUtils/pointState';
import { watchState } from '../ToolWidgetUtils/utils';

const AnnotationToolType = { Ruler: 'Ruler' };

export const PointsLabel = 'points';

function vtkRulerWidgetState(publicAPI, model) {
  const firstPoint = createPointState({
    id: model.id,
    store: publicAPI.getStore(),
    key: 'firstPoint',
    visible: true,
  });
  const secondPoint = createPointState({
    id: model.id,
    store: publicAPI.getStore(),
    key: 'secondPoint',
    visible: true,
  });

  watchState(publicAPI, firstPoint, () => publicAPI.modified());
  watchState(publicAPI, secondPoint, () => publicAPI.modified());

  model.labels = {
    [PointsLabel]: [firstPoint, secondPoint],
  };

  publicAPI.getFirstPoint = () => firstPoint;
  publicAPI.getSecondPoint = () => secondPoint;
}

const defaultValues = (initialValues) => ({
  toolType: AnnotationToolType.Ruler,
  isPlaced: false,
  ...initialValues,
});

function _createRulerWidgetState(publicAPI, model, initialValues) {
  Object.assign(model, defaultValues(initialValues));
  vtkAnnotationWidgetState.extend(publicAPI, model, initialValues);
  bounds.extend(publicAPI, model);

  macro.setGet(publicAPI, model, ['isPlaced']);

  vtkRulerWidgetState(publicAPI, model);
}

const createRulerWidgetState = macro.newInstance(
  _createRulerWidgetState,
  'vtkRulerWidgetState'
);

export default createRulerWidgetState;
