"use client";
import { useEffect, useState } from "react";

export function toast(message: string) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("hub-toast", { detail: message }));
}

export function Toaster() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const handler = (e: Event) => {
      setMsg((e as CustomEvent).detail);
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 1600);
    };
    window.addEventListener("hub-toast", handler);
    return () => {
      window.removeEventListener("hub-toast", handler);
      clearTimeout(t);
    };
  }, []);
  return <div className={"toast" + (show ? " show" : "")}>{msg}</div>;
}
