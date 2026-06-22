import { useState, useEffect, useRef } from 'react';

/**
 * Progressively reveals text word-by-word to create a typing effect.
 * Returns the portion of text revealed so far, and whether typing is still in progress.
 */
export function useTypingEffect(
    text: string,
    enabled: boolean,
    wordsPerTick = 3,
    intervalMs = 30,
): { displayedText: string; isTyping: boolean } {
    const [wordIndex, setWordIndex] = useState(0);
    const wordsRef = useRef<string[]>([]);
    const prevTextRef = useRef('');

    // Reset when text changes
    useEffect(() => {
        if (text !== prevTextRef.current) {
            prevTextRef.current = text;
            wordsRef.current = text.split(/(\s+)/); // preserve whitespace
            setWordIndex(0);
        }
    }, [text]);

    useEffect(() => {
        if (!enabled || wordIndex >= wordsRef.current.length) return;

        const timer = setInterval(() => {
            setWordIndex((prev) => {
                const next = prev + wordsPerTick;
                if (next >= wordsRef.current.length) {
                    clearInterval(timer);
                    return wordsRef.current.length;
                }
                return next;
            });
        }, intervalMs);

        return () => clearInterval(timer);
    }, [enabled, wordIndex, wordsPerTick, intervalMs]);

    if (!enabled) {
        return { displayedText: text, isTyping: false };
    }

    const displayed = wordsRef.current.slice(0, wordIndex).join('');
    const isTyping = wordIndex < wordsRef.current.length;

    return { displayedText: displayed, isTyping };
}
