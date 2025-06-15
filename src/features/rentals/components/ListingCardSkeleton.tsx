import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ListingCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden bg-black/40 backdrop-blur-sm border-white/10">
      {/* Photo Skeleton */}
      <Skeleton className="h-48 w-full bg-white/20 rounded-xl" />

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/5 bg-white/20" />
          <div className="text-right">
            <Skeleton className="h-6 w-20 mb-1 bg-white/20" />
            <Skeleton className="h-3 w-16 bg-white/20" />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center mb-3">
          <Skeleton className="h-4 w-4 mr-1 rounded bg-white/20" />
          <Skeleton className="h-4 w-4/5 bg-white/20" />
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-1 rounded bg-white/20" />
            <Skeleton className="h-4 w-12 bg-white/20" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-1 rounded bg-white/20" />
            <Skeleton className="h-4 w-12 bg-white/20" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-1 rounded bg-white/20" />
            <Skeleton className="h-4 w-12 bg-white/20" />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center mb-3">
          <Skeleton className="h-4 w-4 mr-1 rounded bg-white/20" />
          <Skeleton className="h-4 w-2/3 bg-white/20" />
        </div>

        {/* Features Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
          <Skeleton className="h-5 w-20 rounded-full bg-white/20" />
          <Skeleton className="h-5 w-18 rounded-full bg-white/20" />
        </div>

        {/* Additional Costs */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 bg-white/20" />
            <Skeleton className="h-3 w-16 bg-white/20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 bg-white/20" />
            <Skeleton className="h-3 w-20 bg-white/20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCardSkeleton; 