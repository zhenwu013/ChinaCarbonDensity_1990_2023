// China boundary dataset uploaded to the author's GEE Assets; replace this with your own accessible boundary asset.
// The 'Field' attribute stores subregion ID codes; change regionNameField if your boundary uses another field.
var boundaryAsset = 'users/zhenwu013/SixRegion1';
var regionNameField = 'Field';
var driveFolder = 'GEE_Annual_NDVI';
var exportScale = 30;

// Manually change the year for each annual run (example: 2020).
var year = 2020;

// Manually select the Landsat collection:
// Landsat 5 Collection 1 was used in 2022 to generate NDVI for 1990–2012; this collection is now retired.
// 1990–2012: LANDSAT/LT05/C01/T1_SR (Landsat 5, Collection 1)
// 2013–2023: LANDSAT/LC08/C02/T1_L2 (Landsat 8, Collection 2)
var collectionId = 'LANDSAT/LC08/C02/T1_L2';

// Manually select red/NIR bands to match the collection:
// Landsat 5 C1: red = B3, NIR = B4
// Landsat 8 C2: red = SR_B4, NIR = SR_B5
var redBand = 'SR_B4';
var nirBand = 'SR_B5';

var applyQualityMask = true;

if (year < 1990 || year > 2023 || year !== Math.floor(year)) {
  throw new Error('Please set an integer year between 1990 and 2023.');
}

var isCollection1 = collectionId.indexOf('/C01/') !== -1;
var isCollection2 = collectionId.indexOf('/C02/') !== -1;
if (!isCollection1 && !isCollection2) {
  throw new Error('Supported products: Collection 1 SR or Collection 2 L2.');
}
if (isCollection1 && (redBand.indexOf('SR_') === 0 ||
                      nirBand.indexOf('SR_') === 0)) {
  throw new Error('Collection 1 SR uses B3/B4, not SR_B* names.');
}
if (isCollection2 && (redBand.indexOf('SR_') !== 0 ||
                      nirBand.indexOf('SR_') !== 0)) {
  throw new Error('Collection 2 L2 uses SR_B* names.');
}

var regions = ee.FeatureCollection(boundaryAsset);
var studyArea = regions.geometry();
var startDate = ee.Date.fromYMD(year, 1, 1);
var endDate = startDate.advance(1, 'year');
var landsat = ee.ImageCollection(collectionId)
  .filterBounds(studyArea)
  .filterDate(startDate, endDate);

function qualityMask(image) {
  if (!applyQualityMask) {
    return image;
  }
  var qa;
  var unwantedBits;
  var saturation;

  if (isCollection1) {
    qa = image.select('pixel_qa');
    unwantedBits = (1 << 0) | (1 << 3) | (1 << 4) | (1 << 5);
    saturation = image.select('radsat_qa').eq(0);
  } else {
    qa = image.select('QA_PIXEL');
    unwantedBits = (1 << 0) | (1 << 1) | (1 << 2) |
                   (1 << 3) | (1 << 4) | (1 << 5);
    saturation = image.select('QA_RADSAT').eq(0);
  }
  var valid = qa.bitwiseAnd(unwantedBits).eq(0).and(saturation);
  return image.updateMask(valid);
}

function makeNdvi(image) {
  image = qualityMask(image);

  var red = image.select(redBand);
  var nir = image.select(nirBand);
  if (isCollection1) {
    red = red.multiply(0.0001);
    nir = nir.multiply(0.0001);
  } else {
    red = red.multiply(0.0000275).add(-0.2);
    nir = nir.multiply(0.0000275).add(-0.2);
  }

  var denominator = nir.add(red);
  var ndvi = image.expression(
    '(nir - red) / (nir + red)',
    {nir: nir, red: red}
  ).rename('NDVI').toFloat();

  return ndvi.updateMask(denominator.abs().gt(1e-6))
    .copyProperties(image, ['system:time_start']);
}

print('Manually selected year:', year);
print('Landsat source:', collectionId);
print('Red/NIR:', redBand, nirBand);
print('Collection:', isCollection1 ? 'C1 SR' : 'C2 L2');
print('Apply simple QA mask:', applyQualityMask);
print('Number of scenes intersecting study area:', landsat.size());

if (year === 2013 && collectionId.indexOf('LC08') !== -1) {
  print('2013: Landsat 8 scenes begin in March; the calendar year is partial.');
}

var annualNdvi = landsat.map(makeNdvi).max().rename('NDVI').toFloat();

landsat.size().evaluate(function(sceneCount) {
  if (!sceneCount) {
    print('No scenes found/accessed for the selected source and year. ' +
          'No export tasks will be generated.');
    return;
  }
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
      var prefix = 'NDVI_' + year + '_' + (index + 1) + '_' + safeName;
      Export.image.toDrive({
        image: annualNdvi.clip(geometry),
        description: prefix,
        folder: driveFolder,
        fileNamePrefix: prefix,
        region: geometry,
        scale: exportScale,
        maxPixels: 1e13,
        fileFormat: 'GeoTIFF'
      });
      print('Export task created:', prefix);
    });
    print('Open Tasks and manually start each task. Change the year, ' +
          'collectionId and bands before processing another year.');
  });
});
