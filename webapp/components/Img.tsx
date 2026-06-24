"use client";
import { useEffect, useState } from "react";
import { localFor } from "@/lib/images";

// Prefers the local copy; falls back to the remote CDN url if the local file
// isn't there yet (i.e. before `npm run save-images` has been run).
export default function Img(
  props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }
) {
  const { src, ...rest } = props;
  const [cur, setCur] = useState(() => localFor(src) || src);
  // The hero image reuses one <Img> instance while its src prop changes as the
  // user clicks thumbnails. useState only seeds once, so re-sync (and re-prefer
  // the local copy) whenever src changes — otherwise switching does nothing.
  useEffect(() => {
    setCur(localFor(src) || src);
  }, [src]);
  return (
    <img
      {...rest}
      src={cur}
      onError={(e) => {
        if (cur !== src) setCur(src);
        else (e.currentTarget.style.opacity = "0.25");
      }}
    />
  );
}
