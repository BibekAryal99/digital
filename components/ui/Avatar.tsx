import { cn } from "@/lib/utils";
import { npInitials } from "@/lib/utils";

interface AvatarProps {
  nameNp?: string;
  nameEn?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ nameNp, nameEn, size = "md", className }: AvatarProps) {
  const label = nameNp ? npInitials(nameNp) : (nameEn ?? "?").slice(0, 2);
  const dim =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-navy-100 font-semibold text-navy-700",
        dim,
        className
      )}
      title={nameEn}
    >
      {label}
    </span>
  );
}
