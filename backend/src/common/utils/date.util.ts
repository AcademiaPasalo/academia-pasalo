export const ensureDate = (date: Date | string | number): Date => {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Fecha inválida proporcionada: ${String(date)}`);
  }
  return parsed;
};

export const getEpoch = (date: Date | string | number): number => {
  return ensureDate(date).getTime();
};
