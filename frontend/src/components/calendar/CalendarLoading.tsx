export default function CalendarLoading() {
  return (
    <div className="flex items-center justify-center h-96 flex-shrink-0">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent-light border-t-accent-solid rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Cargando eventos...</p>
      </div>
    </div>
  );
}
