const CafeCardSkeleton = () => {
  return (
    <div className="rounded-xl bg-white p-3 shadow-md space-y-2 animate-pulse">
      {/* Image placeholder - matching CafeCard's aspect-[4/3] */}
      <div className="aspect-[4/3] rounded-lg bg-gray-300"></div>
      
      {/* Text content placeholders */}
      <div className="space-y-1.5">
        {/* Title placeholder */}
        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
        
        {/* Rating and info placeholder */}
        <div className="h-3 w-1/2 rounded bg-gray-300"></div>
        
        {/* Address placeholder */}
        <div className="h-3 w-5/6 rounded bg-gray-300"></div>
        
        {/* Additional info placeholder */}
        <div className="h-3 w-2/3 rounded bg-gray-300"></div>
      </div>
    </div>
  );
};

export default CafeCardSkeleton; 