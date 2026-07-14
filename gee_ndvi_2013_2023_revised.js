/**
 * Annual maximum NDVI from Landsat 8 OLI for 2013–2023.
 *
 * Google Earth Engine JavaScript API / Code Editor.
 *
 * Transparency note:
 * The original NDVI inputs used in the accompanying dataset were generated when
 * Landsat Collection 1 was still available in Google Earth Engine. Those original
 * calculations used annual maximum NDVI without QA-based cloud, shadow, snow, or
 * saturation masking. Because Landsat Collection 1 has since been retired from
 * Earth Engine, this public script provides a Collection 2 implementation of the
 * same general workflow. The use of Collection 2 scaling factors may lead to small
 * numerical differences from the original Collection 1-derived NDVI inputs.
 *
 * Change `year`, run the script, and start the generated export tasks manually.
 */

// ---------------------------- User settings ----------------------------
var boundaryAsset = 'users/your_username/your_boundary_asset';
var regionNameField = 'Field';
var year = 2022; // Valid range for this workflow: 2013–2023.
var exportFolder = 'NDVI_' + year;
var exportScale = 30; // metres

// -------------------------- Input preparation --------------------------
var boundaries = ee.FeatureCollection(boundaryAsset);
var regionNames = boundaries.aggregate_array(regionNameField).distinct().sort();

var startDate = ee.Date.fromYMD(year, 1, 1);
var endDate = startDate.advance(1, 'year'); // filterDate end is exclusive.

// Landsat 8 OLI Collection 2 Level 2 surface reflectance.
// Landsat 9 is not included here to remain consistent with the Landsat 8-based
// workflow used for the original 2013–2023 NDVI inputs.
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(boundaries)
  .filterDate(startDate, endDate);

// Apply Collection 2 surface-reflectance scaling and rename the NIR and red bands.
// No QA-based masking is applied here, to remain consistent with the original
// maximum-NDVI workflow used to produce the dataset.
function prepareLandsat8(image) {
  var reflectance = image
    .select(['SR_B5', 'SR_B4'], ['nir', 'red'])
    .multiply(0.0000275)
    .add(-0.2);

  return reflectance.copyProperties(image, ['system:time_start']);
}

function calculateNdvi(image) {
  var ndvi = image.expression(
    '(nir - red) / (nir + red)',
    {
      nir: image.select('nir'),
      red: image.select('red')
    }
  ).rename('NDVI');

  // Only mask pixels where the denominator is zero.
  return ndvi
    .updateMask(image.select('nir').add(image.select('red')).neq(0))
    .copyProperties(image, ['system:time_start']);
}

var ndviCollection = landsat8.map(prepareLandsat8).map(calculateNdvi);
var annualMaximumNdvi = ndviCollection.max().rename('NDVI');

print('Boundary collection', boundaries);
print('Year', year);
print('Number of Landsat 8 scenes', landsat8.size());
print('Regions used for export', regionNames);

// Replace spaces so that task descriptions and filenames are export-safe.
function makeExportName(value) {
  return String(value).trim().replace(/\s+/g, '_');
}

// One export task is generated for each distinct value in regionNameField.
regionNames.evaluate(function(names, error) {
  if (error) {
    print('Could not read region names:', error);
    return;
  }

  names.forEach(function(regionName) {
    var regionFeatures = boundaries.filter(
      ee.Filter.eq(regionNameField, regionName)
    );
    var regionGeometry = regionFeatures.geometry();
    var safeName = makeExportName(regionName);
    var exportName = 'NDVI_' + safeName + '_' + year;

    Export.image.toDrive({
      image: annualMaximumNdvi.clip(regionGeometry),
      description: exportName,
      folder: exportFolder,
      fileNamePrefix: exportName.toLowerCase(),
      region: regionGeometry,
      scale: exportScale,
      maxPixels: 1e13,
      fileFormat: 'GeoTIFF',
      formatOptions: {cloudOptimized: true}
    });
  });
});
