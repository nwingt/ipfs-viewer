export function processDateTime(datetime) {
  let dateObj = datetime;
  if (typeof datetime === 'string') {
    return datetime.substr(0, 10);
  }
  if (typeof datetime === 'number') {
    let epoch = datetime;
    if (epoch < 10000000000) {
      epoch *= 1000;
    }
    dateObj = new Date(epoch);
  }
  return dateObj.toISOString().substr(0, 10);
}

export default processDateTime;
