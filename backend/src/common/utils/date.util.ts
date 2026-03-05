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

export const toUtcEndOfDay = (date: Date | string | number): Date => {
  const parsed = ensureDate(date);
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
};

export const toUtcStartOfDay = (date: Date | string | number): Date => {
  const parsed = ensureDate(date);
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
};
