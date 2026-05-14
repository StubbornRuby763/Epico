export const Banner = ({ url }: { url: string }) => {
  if (!url) return null;

  return (
    <div className="w-full aspect-[3/1] md:aspect-[4/1] overflow-hidden rounded-2xl bg-gray-200 mb-8 shadow-sm">
      <img
        src={url}
        className="w-full h-full object-cover"
        alt="Store Banner"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          //example
          target.src =
            "https://via.placeholder.com/1200x300?text=Error+Loading+Image";
        }}
      />
    </div>
  );
};
