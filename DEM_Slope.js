// China boundary dataset uploaded to the author's GEE Assets; replace this with your own accessible boundary asset.
// The 'Field' attribute stores subregion ID codes; change regionNameField if your boundary uses another field.
var boundaryAsset = 'users/zhenwu013/SixRegion1';
var regionNameField = 'Field';
var driveFolder = 'GEE_DEM_Slope';
var exportScale = 30;

var regions = ee.FeatureCollection(boundaryAsset);

var elevation = ee.Image('USGS/SRTMGL1_003')
  .select('elevation').rename('Elevation').toFloat();
var slope = ee.Terrain.slope(elevation).rename('Slope').toFloat();

print('Source:', 'USGS/SRTMGL1_003');
print('Outputs: Elevation (m) and Slope (degrees).');

regions.aggregate_array(regionNameField).distinct().evaluate(function(names) {
  if (!names || !names.length) {
    print('No region names found. Check boundaryAsset and regionNameField.');
    return;
  }
  names.forEach(function(name, index) {
    var geometry = regions.filter(ee.Filter.eq(regionNameField, name)).geometry();
    var safeName = String(name).replace(/[^A-Za-z0-9_-]/g, '_');
    if (!safeName || /^_+$/.test(safeName)) {
      safeName = 'region_' + (index + 1);
    }
    var baseName = (index + 1) + '_' + safeName;

    Export.image.toDrive({
      image: elevation.clip(geometry),
      description: 'DEM_' + baseName,
      folder: driveFolder,
      fileNamePrefix: 'DEM_' + baseName,
      region: geometry,
      scale: exportScale,
      maxPixels: 1e13,
      fileFormat: 'GeoTIFF'
    });

    Export.image.toDrive({
      image: slope.clip(geometry),
      description: 'Slope_' + baseName,
      folder: driveFolder,
      fileNamePrefix: 'Slope_' + baseName,
      region: geometry,
      scale: exportScale,
      maxPixels: 1e13,
      fileFormat: 'GeoTIFF'
    });

    print('Created DEM and slope tasks for:', name);
  });
  print('Open Tasks and manually start each export.');
});
