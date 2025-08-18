import vtkWidgetState from '@kitware/vtk.js/Widgets/Core/WidgetState';
import macro from '@kitware/vtk.js/macros';
import { useAnnotationToolStore } from '../../store/tools';

function extend(publicAPI, model, initialValues) {
  vtkWidgetState.extend(publicAPI, model, initialValues);
  macro.get(publicAPI, model, ['id', 'toolType']);

  publicAPI.getStore = () => useAnnotationToolStore(model.toolType);
}

export const vtkAnnotationWidgetState = { extend };

export default { extend };
