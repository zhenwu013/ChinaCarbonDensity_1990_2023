/**
 * Export SRTM elevation and slope for each study region.
 *
 * Google Earth Engine JavaScript API / Code Editor.
 * Run the script once and start the generated export tasks manually.
 */

// ---------------------------- User settings ----------------------------
var boundaryAsset = 'users/your_username/your_boundary_asset';
var regionNameField = 'Field';
var exportFolder = 'SRTM_Terrain';
var exportScale = 30; // metres

// -------------------------- Input preparation --------------------------
var boundaries = ee.FeatureCollection(boundaryAsset);
var regionNames = boundaries.aggregate_array(regionNameField).distinct().sort();

var srtm = ee.Image('USGS/SRTMGL1_003').select('elevation').float();

// Slope must be calculated before clipping. This preserves the neighbouring
// DEM pixels needed to calculate slope at region borders.
var slope = ee.Terrain.slope(srtm).rename('slope');

print('Boundary collection', boundaries);
print('Regions used for export', regionNames);
print('SRTM projection', srtm.projection());

// Replace spaces so that task descriptions and filenames are export-safe.
function makeExportName(value) {
  return String(value).trim().replace(/\s+/g, '_');
}

function exportTerrainLayer(image, regionGeometry, safeName, layerName) {
  var exportName = safeName + '_SRTM30_' + layerName;

  Export.image.toDrive({
    image: image.clip(regionGeometry),
    description: exportName,
    folder: exportFolder,
    fileNamePrefix: exportName,
    region: regionGeometry,
    scale: exportScale,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    formatOptions: {cloudOptimized: true}
  });
}

// One set of two tasks is generated for every distinct region name. Using
// the complete filtered geometry preserves multipart regions.
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

    exportTerrainLayer(srtm, regionGeometry, safeName, 'Elevation');
    exportTerrainLayer(slope, regionGeometry, safeName, 'Slope');
  });
});
