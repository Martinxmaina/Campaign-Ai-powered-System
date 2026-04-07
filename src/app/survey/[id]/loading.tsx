export default function SurveyLoading() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header skeleton */}
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-8 mb-4 animate-pulse">
          <div className="h-3 bg-[#EAEAEA] rounded w-24 mb-4" />
          <div className="h-6 bg-[#EAEAEA] rounded w-3/4 mb-2" />
          <div className="h-4 bg-[#EAEAEA] rounded w-1/2" />
        </div>
        {/* Question skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 mb-3 animate-pulse">
            <div className="h-4 bg-[#EAEAEA] rounded w-2/3 mb-4" />
            <div className="space-y-2">
              <div className="h-10 bg-[#EAEAEA] rounded" />
              <div className="h-10 bg-[#EAEAEA] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
