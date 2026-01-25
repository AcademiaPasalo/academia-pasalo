const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

const updateGeoIp = () => {
  const licenseKey = process.env.MAXMIND_LICENSE_KEY;

  if (!licenseKey) {
    console.error('Error: MAXMIND_LICENSE_KEY no encontrada en el archivo .env');
    process.exit(1);
  }

  const scriptPath = path.join(
    __dirname,
    '../node_modules/geoip-lite/scripts/updatedb.js',
  );

  console.log('Iniciando actualización de base de datos GeoIP (MaxMind)...');
  console.log('Este proceso puede demorar varios minutos. Por favor, espere.');

  try {
    execSync(`node "${scriptPath}" license_key=${licenseKey}`, {
      stdio: 'inherit',
    });
    console.log('Actualización de GeoIP completada exitosamente.');
  } catch (error) {
    console.error('Fallo al actualizar la base de datos GeoIP.');
    console.error(error.message);
    process.exit(1);
  }
};

updateGeoIp();
