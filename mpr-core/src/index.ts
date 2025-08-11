import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import type { TypedArray } from '@kitware/vtk.js/types';

export interface SliceResult {
  /** raw pixel data for a slice */
  data: TypedArray;
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
  /** current intersection in IJK space */
  ijk: [number, number, number];
}

function extractSlice(
  image: vtkImageData,
  ijk: [number, number, number],
  plane: 'axial' | 'coronal' | 'sagittal'
): SliceResult {
  const reslice = vtkImageReslice.newInstance();
  reslice.setInputData(image);

  const origin = image.indexToWorld(ijk);

  let xAxis: [number, number, number];
  let yAxis: [number, number, number];
  let zAxis: [number, number, number];
  const dims = image.getDimensions();
  let width = 0;
  let height = 0;

  switch (plane) {
    case 'axial':
      xAxis = [1, 0, 0];
      yAxis = [0, 1, 0];
      zAxis = [0, 0, 1];
      width = dims[0];
      height = dims[1];
      break;
    case 'coronal':
      xAxis = [1, 0, 0];
      yAxis = [0, 0, 1];
      zAxis = [0, 1, 0];
      width = dims[0];
      height = dims[2];
      break;
    case 'sagittal':
      xAxis = [0, 1, 0];
      yAxis = [0, 0, 1];
      zAxis = [1, 0, 0];
      width = dims[1];
      height = dims[2];
      break;
    default:
      xAxis = [1, 0, 0];
      yAxis = [0, 1, 0];
      zAxis = [0, 0, 1];
      width = dims[0];
      height = dims[1];
      break;
  }

  const axes = new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], origin[0],
    xAxis[1], yAxis[1], zAxis[1], origin[1],
    xAxis[2], yAxis[2], zAxis[2], origin[2],
    0, 0, 0, 1,
  ]);
  reslice.setResliceAxes(axes as any);
  reslice.setOutputExtent([0, width - 1, 0, height - 1, 0, 0]);
  reslice.update();

  const output = reslice.getOutputData();
  const data = output.getPointData().getScalars().getData();
  return { data, size: [width, height] };
}

/**
 * Initialize the MPR state from a vtkImageData constructed from DICOM
 * series. Returns the initial three orthogonal slices and cross hair
 * coordinates mapped to 2D view space.
 */
export function initMPR(image: vtkImageData): MPRResult & { state: MPRState } {
  const dims = image.getDimensions();
  const ijk: [number, number, number] = [
    Math.floor(dims[0] / 2),
    Math.floor(dims[1] / 2),
    Math.floor(dims[2] / 2),
  ];

  const axial = extractSlice(image, ijk, 'axial');
  const coronal = extractSlice(image, ijk, 'coronal');
  const sagittal = extractSlice(image, ijk, 'sagittal');

  return {
    axial,
    coronal,
    sagittal,
    crossLines: {
      axial: [ijk[0], ijk[1]],
      coronal: [ijk[0], ijk[2]],
      sagittal: [ijk[1], ijk[2]],
    },
    state: { image, ijk },
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
  const dims = state.image.getDimensions();
  const ijk: [number, number, number] = [
    Math.min(Math.max(Math.round(coords.axial[0]), 0), dims[0] - 1),
    Math.min(Math.max(Math.round(coords.axial[1]), 0), dims[1] - 1),
    Math.min(Math.max(Math.round(coords.coronal[1]), 0), dims[2] - 1),
  ];

  state.ijk = ijk;

  const axial = extractSlice(state.image, ijk, 'axial');
  const coronal = extractSlice(state.image, ijk, 'coronal');
  const sagittal = extractSlice(state.image, ijk, 'sagittal');

  return {
    axial,
    coronal,
    sagittal,
    crossLines: {
      axial: [ijk[0], ijk[1]],
      coronal: [ijk[0], ijk[2]],
      sagittal: [ijk[1], ijk[2]],
    },
  };
}

export default {
  initMPR,
  updateMPR,
};
