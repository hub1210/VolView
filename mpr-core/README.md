# mpr-core

This package exposes the minimal interfaces required to perform
multiplanar reconstruction (MPR) outside of the full VolView
application.  It provides two functions:

- `initMPR(image)` – initialize the MPR state using a `vtkImageData`
  constructed from a DICOM series. Returns the initial orthogonal slice
  data and cross-hair coordinates along with an internal state object.
- `updateMPR(state, coords)` – update the slice orientations given new
  2D cross-hair coordinates and return the resliced pixel data.

The current implementation contains placeholders where application code
may plug in custom reslicing logic or further data transformations.
