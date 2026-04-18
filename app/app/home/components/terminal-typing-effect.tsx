"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type TerminalTypingEffectProps = {
  installTargets: string[];
};

export function TerminalTypingEffect({
  installTargets,
}: TerminalTypingEffectProps) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const stringsToType =
      installTargets.length > 0
        ? installTargets
        : [`${site.skillInstallBase}/your-skill`];
    const currentStringIndex = loopNum % stringsToType.length;
    const fullText = stringsToType[currentStringIndex];
    const prefix = `${site.skillInstallBase}/`;

    const typingDelay = 80;
    const deletingDelay = 60;
    const pauseAfterTyping = 1700;
    const pauseBeforeTypingNew = 200;
    const baseSpeed = isDeleting ? deletingDelay : typingDelay;
    const typingSpeed = isDeleting ? baseSpeed : baseSpeed + Math.random() * 40;

    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        return;
      }

      setText(fullText.substring(0, text.length + 1));
    }

    if (!isDeleting && text === fullText) {
      timer = setTimeout(() => setIsDeleting(true), pauseAfterTyping);
    } else if (isDeleting && text === prefix) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setLoopNum((currentLoopNum) => currentLoopNum + 1);
      }, pauseBeforeTypingNew);
    } else {
      timer = setTimeout(tick, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [installTargets, isDeleting, loopNum, text]);

  return <span className="string">{text}</span>;
}
