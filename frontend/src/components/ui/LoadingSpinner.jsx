import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "default", text = "" }) => {
  const sizeMap = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeMap[size]} animate-spin text-black`} />
      {text && <p className="text-sm text-text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
