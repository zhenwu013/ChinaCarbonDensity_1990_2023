# Google Earth Engine Processing Scripts

This repository contains Google Earth Engine scripts for preparing annual Normalized Difference Vegetation Index (NDVI), elevation, and slope inputs used in the accompanying carbon-density dataset and paper.

Because Landsat Collection 1 has been retired from the Earth Engine data catalogue, the public NDVI scripts provided here have been migrated to Landsat Collection 2 Level 2 surface reflectance. The Collection 2 scripts document the same general annual maximum NDVI workflow, but they may not reproduce the original Collection 1-derived NDVI inputs bit-for-bit.

## Scripts

- `gee_ndvi_1990_2012.js`: generates annual maximum NDVI from Landsat 5 TM Collection 2 Level 2 surface reflectance for 1990–2012.
- `gee_ndvi_2013_2023.js`: generates annual maximum NDVI from Landsat 8 OLI Collection 2 Level 2 surface reflectance for 2013–2023.
- `gee_dem_slope.js`: exports elevation and slope from the SRTM 30 m DEM.

## Requirements

- A Google Earth Engine account
- Access to the Google Earth Engine Code Editor
- A study-region boundary uploaded to Google Earth Engine Assets
- Google Drive access for exported GeoTIFF files

## Boundary Data

Upload the study-region boundary to your Google Earth Engine Assets. In each script, replace:

```javascript
var boundaryAsset = 'users/your_username/your_boundary_asset';
```

The boundary must be an Earth Engine `FeatureCollection` containing an attribute that identifies each study region. The default attribute name is `Field`:

```javascript
var regionNameField = 'Field';
```

Change `regionNameField` if the boundary data use a different attribute name. Each distinct attribute value generates a separate set of export tasks. Region names should not contain special filename characters.

The boundary dataset is not included in this repository. Users should provide their own boundary data or use the boundary file released with the accompanying dataset, if available.

## Landsat Collection 1 and Collection 2 Note

The original NDVI inputs used for the carbon-density dataset were generated when Landsat Collection 1 was still available in Google Earth Engine. The original workflow calculated annual maximum NDVI from Landsat surface reflectance imagery.

Because Landsat Collection 1 is no longer available in the current Earth Engine catalogue, the public scripts have been migrated to Landsat Collection 2 Level 2 surface reflectance. Collection 2 uses a different radiometric scaling from Collection 1. In the scripts provided here, Collection 2 optical surface-reflectance bands are converted as:

```text
surface reflectance = DN × 0.0000275 − 0.2
```

The annual maximum NDVI workflow is otherwise kept as close as possible to the original processing logic. However, users should expect small numerical differences between NDVI layers generated with these Collection 2 scripts and the original Collection 1-derived NDVI layers used in the published dataset. Differences may arise from changes in Landsat product processing, radiometric scaling, scene availability, and collection version.

These scripts are provided for transparency and approximate reproducibility under the current Earth Engine data catalogue.

## Annual NDVI Workflow

The NDVI scripts generate export tasks for one year at a time. The tasks must be started manually in the Earth Engine Code Editor.

1. Open the appropriate NDVI script in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Set `year` to the required year.
5. Click **Run** in the Earth Engine Code Editor.
6. Check the Console for the number of Landsat scenes and the region names.
7. Open the **Tasks** tab and click **Run** for each generated export task.
8. Repeat these steps for each required year.

Use the following year ranges:

- `gee_ndvi_1990_2012.js`: 1990–2012
- `gee_ndvi_2013_2023.js`: 2013–2023

Landsat 8 observations begin during 2013. Therefore, the 2013 result covers only the part of that year for which Landsat 8 observations are available.

## NDVI Calculation

NDVI is calculated from the near-infrared and red surface-reflectance bands:

```text
NDVI = (NIR − Red) / (NIR + Red)
```

For Landsat 5 TM, the script uses:

```text
NIR = SR_B4
Red = SR_B3
```

For Landsat 8 OLI, the script uses:

```text
NIR = SR_B5
Red = SR_B4
```

For each year, all available Landsat images within the calendar year are used to generate annual maximum NDVI on a pixel-by-pixel basis.

## SRTM Elevation and Slope Workflow

1. Open `gee_dem_slope.js` in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Click **Run**.
5. Open the **Tasks** tab and manually start the elevation and slope export tasks for every study region.

Elevation is expressed in metres, and slope is expressed in degrees.

## Outputs

All outputs are exported to Google Drive as 30 m GeoTIFF files.

## Data Sources

- USGS Landsat 5 Level 2, Collection 2, Tier 1: `LANDSAT/LT05/C02/T1_L2`
- USGS Landsat 8 Level 2, Collection 2, Tier 1: `LANDSAT/LC08/C02/T1_L2`
- NASA/USGS/JPL-Caltech SRTM 30 m: `USGS/SRTMGL1_003`

## Citation

Please cite the corresponding Landsat and SRTM datasets, Google Earth Engine, the boundary data source, and the accompanying paper when using these scripts.
