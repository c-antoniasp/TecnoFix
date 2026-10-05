import type { FC } from "react";

// Logo de TecnoFix: engranaje con tuerca hexagonal (igual que public/favicon.svg).
// Los huecos son transparentes, así se ve el fondo del contenedor de la marca.
const GEAR_PATH = "M29.15 17.07 L29.86 13.12 L34.14 13.12 L34.85 17.07 L38.47 18.25 L41.36 15.47 L44.83 17.99 L43.08 21.59 L45.32 24.68 L49.29 24.13 L50.62 28.21 L47.08 30.09 L47.08 33.91 L50.62 35.79 L49.29 39.87 L45.32 39.32 L43.08 42.41 L44.83 46.01 L41.36 48.53 L38.47 45.75 L34.85 46.93 L34.14 50.88 L29.86 50.88 L29.15 46.93 L25.53 45.75 L22.64 48.53 L19.17 46.01 L20.92 42.41 L18.68 39.32 L14.71 39.87 L13.38 35.79 L16.92 33.91 L16.92 30.09 L13.38 28.21 L14.71 24.13 L18.68 24.68 L20.92 21.59 L19.17 17.99 L22.64 15.47 L25.53 18.25 Z M40.6 32 A8.6 8.6 0 1 0 23.4 32 A8.6 8.6 0 1 0 40.6 32 Z";
const NUT_PATH = "M37.37 35.10 L32.00 38.20 L26.63 35.10 L26.63 28.90 L32.00 25.80 L37.37 28.90 Z M34.6 32 A2.6 2.6 0 1 0 29.4 32 A2.6 2.6 0 1 0 34.6 32 Z";

interface TecnoFixGearProps {
  size?: number;
  color?: string;
}

const TecnoFixGear: FC<TecnoFixGearProps> = ({ size = 22, color = "#0F172A" }) => (
  <svg viewBox="12 12 40 40" width={size} height={size} aria-hidden="true">
    <path fill={color} fillRule="evenodd" d={GEAR_PATH} />
    <path fill={color} fillRule="evenodd" d={NUT_PATH} />
  </svg>
);

export default TecnoFixGear;
