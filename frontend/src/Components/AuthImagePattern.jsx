const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-100/80 p-12">
      <div className="max-w-md text-center">
        {/* Pattern Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8" aria-hidden="true">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-[#b2bec3]/40 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-2xl font-bold mb-4 text-white-500">{title}</h2>
        <p className="text-base text-white-500/70">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
