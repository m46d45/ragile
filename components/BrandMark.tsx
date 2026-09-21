import Link from "next/link";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link href="/" className={`${cls} font-bold text-primary`}>
      Ragil<span className="text-accent">E</span>
    </Link>
  );
}
