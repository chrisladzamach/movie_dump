export function DesktopBlocker() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-2xl font-bold text-white mb-4">Movie Dump</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Esta aplicación solo está disponible para dispositivos móviles.
        </p>
      </div>
    </div>
  );
}
