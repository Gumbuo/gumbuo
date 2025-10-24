"use client";

export default function AlienDivider() {
  return (
    <div className="w-full flex items-center justify-center py-8 overflow-hidden">
      <div className="flex items-center space-x-4 animate-pulse">
        <span className="text-4xl animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}>🛸</span>
        <span className="text-3xl animate-bounce" style={{animationDelay: '0.2s', animationDuration: '2s'}}>👽</span>
        <span className="text-4xl animate-bounce" style={{animationDelay: '0.4s', animationDuration: '2s'}}>🛸</span>
        <span className="text-3xl animate-bounce" style={{animationDelay: '0.6s', animationDuration: '2s'}}>⭐</span>
        <span className="text-4xl animate-bounce" style={{animationDelay: '0.8s', animationDuration: '2s'}}>🛸</span>
        <span className="text-3xl animate-bounce" style={{animationDelay: '1s', animationDuration: '2s'}}>👽</span>
        <span className="text-4xl animate-bounce" style={{animationDelay: '1.2s', animationDuration: '2s'}}>🛸</span>
      </div>
    </div>
  );
}
