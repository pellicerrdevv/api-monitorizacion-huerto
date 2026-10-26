export const SENSOR_MAGNITUDES = [
  "soil_moisture",
  "temperature",
  "light",
  "air_humidity",
] as const;
export type SensorMagnitude = (typeof SENSOR_MAGNITUDES)[number];
