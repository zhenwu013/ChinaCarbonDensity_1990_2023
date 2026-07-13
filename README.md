# GEE scripts for NDVI, DEM and slope processing

This repository provides the Google Earth Engine scripts used to generate predictor variables for the 1-km annual carbon-density dataset across China from 1990 to 2023.

## Scripts

- `gee_ndvi_1990_2012.js`: calculates annual maximum NDVI from Landsat 5 surface reflectance imagery for 1990–2012.
- `gee_ndvi_2013_2023.js`: calculates annual maximum NDVI from Landsat 8 surface reflectance imagery for 2013–2023.
- `gee_dem_slope.js`: extracts DEM and calculates slope from SRTM data.

## Required GEE asset

The scripts use a China regional boundary FeatureCollection. Users should replace the asset path in the scripts with their own boundary asset:

```javascript
var china_boundary = ee.FeatureCollection("users/your_username/your_boundary_asset");
