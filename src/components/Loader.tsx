export default function Loading() {
    return (
      <div className="fixed inset-0  z-50 flex items-center justify-center">
        {/* Main loading element */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 border-4 border-transparent rounded-full 
            [border-image:linear-gradient(to_bottom,#A92EDF,#7B3FE4)_1] animate-spin-slow">
          </div>
          {/* Inner dot with gradient */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    );
  }