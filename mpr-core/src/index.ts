import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkResliceCursorWidget from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget';

export interface SliceResult {
  /** raw pixel data for a slice */
  data: Uint8Array | Uint16Array;
  /** width and height of the slice */
  size: [number, number];
}

export interface MPRResult {
  axial: SliceResult;
  coronal: SliceResult;
  sagittal: SliceResult;
  /** 2D coordinates of the cross hair lines in each view */
  crossLines: {
    axial: [number, number];
    coronal: [number, number];
    sagittal: [number, number];
  };
}

export interface MPRState {
  image: vtkImageData;
  resliceCursor: vtkResliceCursorWidget;
}

/**
 * Initialize the MPR state from a vtkImageData constructed from DICOM
 * series. Returns the initial three orthogonal slices and cross hair
 * coordinates mapped to 2D view space.
 */
export function initMPR(image: vtkImageData): MPRResult & { state: MPRState } {
  const resliceCursor = vtkResliceCursorWidget.newInstance();
  resliceCursor.setImage(image);

  const mapper = vtkImageResliceMapper.newInstance();
  mapper.setInputData(image);
  const slice = vtkImageSlice.newInstance();
  slice.setMapper(mapper);

  // vtk.js will internally compute slice output when origin/normal is set.
  // Here we simply return empty pixel arrays as placeholder. Application
  // using this library should replace the logic with actual rendering.
  const empty = { data: new Uint8Array(), size: [0, 0] as [number, number] };

  return {
    axial: empty,
    coronal: empty,
    sagittal: empty,
    crossLines: {
      axial: [0, 0],
      coronal: [0, 0],
      sagittal: [0, 0],
    },
    state: { image, resliceCursor },
  };
}

/**
 * Update the slice orientation based on new 2D cross hair coordinates and
 * return the newly resliced pixel data.
 */
export function updateMPR(
  state: MPRState,
  coords: { axial: [number, number]; coronal: [number, number]; sagittal: [number, number] }
): MPRResult {
  // TODO: compute plane normals from coordinates and update the reslice cursor
  // to generate new slice pixel data. This placeholder simply echoes back
  // empty arrays so that the API is defined for downstream consumers.
  const empty = { data: new Uint8Array(), size: [0, 0] as [number, number] };

  return {
    axial: empty,
    coronal: empty,
    sagittal: empty,
    crossLines: coords,
  };
}

export default {
  initMPR,
  updateMPR,
};
