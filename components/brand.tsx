import Link from "next/link";
import { Compass } from "lucide-react";

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark">
        <Compass size={18} />
      </span>
      <span>Meridian</span>
    </Link>
  );
}
