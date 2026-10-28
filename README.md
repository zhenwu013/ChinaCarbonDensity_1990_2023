# Google Earth Engine Processing Scripts

This repository contains Google Earth Engine (GEE) scripts for preparing annual Normalized Difference Vegetation Index (NDVI), elevation, and slope inputs used in the study “A 1-km annual dataset of vegetation and soil carbon density across China's terrestrial ecosystems from 1990 to 2023.”

The NDVI script documents the historical Landsat data sources used in the study. Landsat 5 Collection 1 was used in 2022 to generate NDVI for 1990–2012, while Landsat 8 Collection 2 was used for 2013–2023. Landsat Collection 1 has since been retired from Google Earth Engine and is no longer directly accessible through its original collection ID. Users may select alternative available data sources, but doing so may produce different NDVI results.

## Scripts

- `NDVI_1990_2023.js`: Calculates and exports annual maximum NDVI from Landsat surface reflectance imagery for a selected year.
- `DEM_Slope.js`: Extracts elevation and calculates slope from the SRTM 30-m digital elevation model.

## Requirements

- A Google Earth Engine account with access to the Code Editor.
- A study-region boundary dataset uploaded to Google Earth Engine Assets.
- Google Drive access for exporting GeoTIFF files.

The scripts refer to users/zhenwu013/SixRegion1, a China boundary dataset uploaded to the author's GEE Assets. The Field attribute contains subregion identification codes. Users should replace boundaryAsset with their own accessible boundary asset and modify regionNameField if their boundary data use a different attribute name.


## Annual NDVI Workflow

The NDVI script generates export tasks for one year at a time. The tasks must be started manually in the Earth Engine Code Editor.

1. Open `NDVI_1990_2023.js` in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Set year, collectionId, redBand, and nirBand according to the required year and Landsat collection, as indicated in the script.
5. Click **Run** in the Earth Engine Code Editor.
6. Check the Console for the number of Landsat scenes and the region names.
7. Open the **Tasks** tab and click **Run** for each generated export task.
8. Repeat these steps for each required year.


## SRTM Elevation and Slope Workflow

1. Open `DEM_Slope.js` in the Earth Engine Code Editor.
2. Replace `boundaryAsset` with the path to the study-region boundary.
3. Change `regionNameField` if the region-name attribute is not `Field`.
4. Click **Run**.
5. Open the **Tasks** tab and manually start the elevation and slope export tasks for every study region.

Elevation is expressed in metres, and slope is expressed in degrees.

## Outputs

All outputs are exported to Google Drive as 30 m GeoTIFF files.


## Citation

Please cite the corresponding Landsat and SRTM datasets, Google Earth Engine, the boundary data source, and the accompanying paper when using these scripts.
