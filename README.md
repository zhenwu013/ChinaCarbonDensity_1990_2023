# Google Earth Engine Processing Scripts

This repository contains Google Earth Engine scripts used to generate annual
maximum Normalized Difference Vegetation Index (NDVI), elevation, and slope
data for the study regions described in the accompanying paper.

The scripts were migrated to Landsat Collection 2.

## Scripts

- `gee_ndvi_1990_2012.js`: generates annual maximum NDVI from Landsat 5 TM
  Collection 2 Level 2 surface reflectance for 1990-2012.
- `gee_ndvi_2013_2023.js`: generates annual maximum NDVI from Landsat 8 OLI
  Collection 2 Level 2 surface reflectance for 2013-2023.
- `gee_dem_slope.js`: exports elevation and slope from the SRTM 30 m DEM.

## Requirements

- A Google Earth Engine account
- Access to the Google Earth Engine Code Editor
- A study-region boundary uploaded to Google Earth Engine Assets
- Google Drive access for exported GeoTIFF files

## Boundary Data

Upload the study-region boundary to your Google Earth Engine Assets. In each
script, replace:

```javascript
var boundaryAsset = 'users/your_username/your_boundary_asset';
```

The boundary must be an Earth Engine `FeatureCollection` containing an
attribute that identifies each study region. The default attribute name is
`Field`:

```javascript
var regionNameField = 'Field';
```

Change `regionNameField` if the boundary data use a different attribute name.
Each distinct attribute value generates a separate set of export tasks. Region
names should not contain special filename characters.

The boundary dataset is not included in this repository. Users should provide
their own boundary data.

## Annual NDVI Workflow

The NDVI scripts generate export tasks for one year at a time. The tasks must
be started manually in the Earth Engine Code Editor.

1. Open the appropriate NDVI script in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Set `year` to the required year.
5. Click **Run** in the Earth Engine Code Editor.
6. Check the Console for the number of Landsat scenes and the region names.
7. Open the **Tasks** tab and click **Run** for each generated export task.
8. Repeat these steps for each required year.

Use the following year ranges:

- `gee_ndvi_1990_2012.js`: 1990-2012
- `gee_ndvi_2013_2023.js`: 2013-2023

Landsat 8 observations begin during 2013. Therefore, the 2013 result covers
only the portion of that year for which Landsat 8 observations are available.

## SRTM Elevation and Slope Workflow

1. Open `gee_dem_slope.js` in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Click **Run**.
5. Open the **Tasks** tab and manually start the elevation and slope export
   tasks for every study region.

Slope is calculated from the complete SRTM image before clipping to the study
regions. Elevation is expressed in metres, and slope is expressed in degrees.

## Outputs

All outputs are exported to Google Drive as 30 m Cloud Optimized GeoTIFF files.

The NDVI scripts create a year-specific Google Drive folder:

```text
NDVI_<year>
```

Terrain outputs are written to:

```text
SRTM_Terrain
```

One NDVI task per region is generated for each selected year. The terrain
script generates one elevation task and one slope task per region.

Earth Engine may use different native projections across Landsat scenes. If
the downstream analysis requires an exactly aligned multi-year raster grid,
specify a common `crs` and `crsTransform` in the export settings.

## Data Sources

- USGS Landsat 5 Level 2, Collection 2, Tier 1:
  `LANDSAT/LT05/C02/T1_L2`
- USGS Landsat 8 Level 2, Collection 2, Tier 1:
  `LANDSAT/LC08/C02/T1_L2`
- NASA/USGS/JPL-Caltech SRTM 30 m:
  `USGS/SRTMGL1_003`

## Citation

Please cite the corresponding Landsat and SRTM datasets, Google Earth Engine,
the boundary data source, and the accompanying paper when using these scripts.
