import { processDateTime } from './misc';

const exifParser = require('exif-parser');

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        resolve(reader.result);
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function removeExif(file) {
  const imageArrayBuffer = await fileToArrayBuffer(file);
  const dv = new DataView(imageArrayBuffer);
  let offset = 0;
  let recess = 0;
  const pieces = [];
  if (dv.getUint16(offset) === 0xffd8) {
    offset += 2;
    let app1 = dv.getUint16(offset);
    offset += 2;
    while (offset < dv.byteLength) {
      if (app1 === 0xffe1) {
        pieces.push({ recess, offset: offset - 2 });
        recess = offset + dv.getUint16(offset);
      } else if (app1 === 0xffda) {
        break;
      }
      offset += dv.getUint16(offset);
      app1 = dv.getUint16(offset);
      offset += 2;
    }
    if (pieces.length > 0) {
      const newPieces = [];
      pieces.forEach((v) => {
        newPieces.push(imageArrayBuffer.slice(v.recess, v.offset));
      });
      newPieces.push(imageArrayBuffer.slice(recess));
      const blob = new Blob(newPieces, { type: 'image/jpeg' });
      return new File([blob], 'image.jpeg', { lastModified: Date.now() });
    }
  }
  return null;
}

export async function processEXIF(file) {
  const buf = await fileToArrayBuffer(file);
  const exifData = exifParser.create(buf).parse();
  if (!exifData.app1Offset) {
    return null;
  }
  const output = {};
  const {
    Artist,
    CreateDate,
    GPSLatitude,
    GPSLatitudeRef,
    GPSLongitude,
    GPSLongitudeRef,
    ImageDescription,
  } = exifData.tags;
  if (Artist) {
    output.author = Artist;
  }
  if (CreateDate) {
    output.dateTime = processDateTime(CreateDate);
  }
  if (GPSLatitude && GPSLatitudeRef) {
    output.latitude = `${GPSLatitude}${GPSLatitudeRef}`;
  }
  if (GPSLongitude && GPSLongitudeRef) {
    output.longitude = `${GPSLongitude}${GPSLongitudeRef}`;
  }
  if (ImageDescription) {
    output.description = ImageDescription;
  }
  return output;
}
