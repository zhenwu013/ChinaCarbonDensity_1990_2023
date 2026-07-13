/**
 * Annual maximum NDVI from Landsat 8 OLI (2013-2023).
 *
 * Google Earth Engine JavaScript API / Code Editor.
 * Change `year`, run the script, and start the generated export tasks manually.
 */

// ---------------------------- User settings ----------------------------
var boundaryAsset = 'users/your_username/your_boundary_asset';
var regionNameField = 'Field';
var year = 2022; // Valid range for this workflow: 2013-2023.
var exportFolder = 'NDVI_' + year;
var exportScale = 30; // metres

// -------------------------- Input preparation --------------------------
var boundaries = ee.FeatureCollection(boundaryAsset);
var regionNames = boundaries.aggregate_array(regionNameField).distinct().sort();

var startDate = ee.Date.fromYMD(year, 1, 1);
var endDate = startDate.advance(1, 'year'); // filterDate end is exclusive.

var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(boundaries)
  .filterDate(startDate, endDate);

// Mask fill, dilated cloud, cirrus, cloud, cloud shadow and snow
// (QA_PIXEL bits 0-5), mask saturated pixels, and apply C2 SR scaling.
function prepareLandsat8(image) {
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(63).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  var reflectance = image
    .select(['SR_B5', 'SR_B4'], ['nir', 'red'])
    .multiply(0.0000275)
    .add(-0.2);

  // Exclude values outside the nominal surface-reflectance interval.
  var reflectanceMask = reflectance
    .gte(0)
    .and(reflectance.lte(1))
    .reduce(ee.Reducer.min());

  return reflectance
    .updateMask(qaMask)
    .updateMask(saturationMask)
    .updateMask(reflectanceMask)
    .copyProperties(image, ['system:time_start']);
}

function calculateNdvi(image) {
  var ndvi = image.expression(
    '(nir - red) / (nir + red)',
    {
      nir: image.select('nir'),
      red: image.select('red')
    }
  ).rename('NDVI');

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

