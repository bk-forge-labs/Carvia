const AppError = require('../utils/AppError');
const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
function formatter(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', {timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'});
  } catch { throw new AppError('Choose a valid IANA timezone, such as Europe/Berlin.', 400); }
}
function formattedWallTime(date, format) {
  const parts = Object.fromEntries(format.formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
function wallTime(date, timeZone) {return formattedWallTime(date, formatter(timeZone));}
function resolveTime(local, timeZone, occurrence = '') {
  const match = typeof local === 'string' && pattern.exec(local);
  if (!match) throw new AppError('Use a local date and time including minutes.', 400);
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (year < 2000 || year > 2100) throw new AppError('Choose a year between 2000 and 2100.', 400);
  const format = formatter(timeZone);
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(naive).toISOString().slice(0,16) !== local) throw new AppError('Choose a valid date and time.', 400);
  const matches = [];
  // Modern IANA offsets use 15-minute increments, including half/quarter-hour zones.
  for (let offset = -840; offset <= 840; offset += 15) {
    const candidate = new Date(naive + offset * 60000);
    if (formattedWallTime(candidate, format) === local) matches.push(candidate);
  }
  if (!matches.length) throw new AppError('This local time does not exist because the clocks move forward. Choose another time.', 400);
  if (matches.length > 1 && !['earlier','later'].includes(occurrence)) throw new AppError('This local time occurs twice because the clocks move back. Choose the earlier or later occurrence.', 400);
  return matches[occurrence === 'later' ? matches.length - 1 : 0];
}
function interval(body) {
  const start = resolveTime(body.startLocal, body.timeZone, body.startOccurrence);
  const end = resolveTime(body.endLocal, body.timeZone, body.endOccurrence);
  if (end <= start) throw new AppError('End must be after start.', 400);
  if (end - start > 24 * 60 * 60 * 1000) throw new AppError('Appointments may last up to 24 hours.', 400);
  return {start, end, timeZone: body.timeZone};
}
module.exports = {resolveTime, wallTime, interval};
