package org.rainbow

import org.rainbow.RainbowDeckType.Format.block
import org.rainbow.RainbowDeckType.Format.char
import org.rainbow.RainbowDeckType.Format.original

enum class RainbowDeckType(
    val front: Format,
    val back: Format
) {
    blockToBlock(block, block),
    charToChar(char, char),
    blockToChar(block, char),
    charToBlock(char, block),
    blockToOriginal(block, original),
    originalToBlock(original, block),
    charToOriginal(char, original),
    originalToChar(original, char),
    ;

    enum class Format {
        block,
        char,
        original
    }
}