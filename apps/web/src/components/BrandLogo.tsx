import { Handshake } from "lucide-react";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    outer: "h-11 w-11 rounded-xl",
    inner: "h-8 w-8 rounded-lg",
    icon: 18,
  },
  md: {
    outer: "h-16 w-16 rounded-2xl",
    inner: "h-11 w-11 rounded-xl",
    icon: 24,
  },
  lg: {
    outer: "h-24 w-24 rounded-[28px]",
    inner: "h-16 w-16 rounded-2xl",
    icon: 34,
  },
} as const;

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const logoSize = sizes[size];

  return (
    <div
      className={`${logoSize.outer} flex shrink-0 items-center justify-center bg-white shadow-lg`}
      role="img"
      aria-label="ShramiGo logo"
    >
      <div
        className={`${logoSize.inner} flex items-center justify-center bg-[#FF5A00]`}
      >
        <Handshake
          size={logoSize.icon}
          strokeWidth={2.2}
          className="text-white"
        />
      </div>
    </div>
  );
}
