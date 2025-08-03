// "use client";

// export function FullPageSpinner() {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
//       <div className="relative">
//         {/* Outer ring */}
//         <div className="h-16 w-16 rounded-full border-4 border-gray-300 border-t-transparent animate-spin"></div>

//         {/* Optional inner dot (remove if not needed) */}
//         <div className="absolute inset-0 m-auto h-4 w-4 rounded-full bg-primary"></div>
//       </div>
//     </div>
//   );
// }

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-white animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
