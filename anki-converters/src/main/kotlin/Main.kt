package org.rainbow

import org.rainbow.RainbowDeckType.Format
import java.io.File
import kotlin.Char
import kotlin.collections.setOf


val accentChars = setOf<Char>('á', 'é', 'ó', 'í', 'ú')
val tildeChars = setOf<Char>('ñ')
val umlautChars = setOf<Char>('ä', 'ö', 'ü')

val colorMap = mapOf<Char, String>(
    Pair('a', "#FFA3E2"),
    Pair('e', "#A9E5A9"),
    Pair('i', "#BAA3FF"),
    Pair('o', "#FFCB94"),
    Pair('u', "#90D8F9"),
    Pair('á', "#FFA3E2"),
    Pair('é', "#A9E5A9"),
    Pair('í', "#BAA3FF"),
    Pair('ó', "#FFCB94"),
    Pair('ú', "#90D8F9"),
    Pair('ä', "#FFA3E2"),
    Pair('ö', "#FFCB94"),
    Pair('ü', "#90D8F9"),
    Pair('b', "#6699FF"),
    Pair('c', "#00EBEB"),
    Pair('d', "#FF6600"),
    Pair('f', "#FF00CC"),
    Pair('g', "#33FF33"),
    Pair('h', "#DD2782"),
    Pair('j', "#00CC66"),
    Pair('k', "#CCB300"),
    Pair('l', "#FF6B6B"),
    Pair('m', "#CC00FF"),
    Pair('n', "#37B1B3"),
    Pair('ñ', "#37B1B3"),
    Pair('p', "#9900FF"),
    Pair('q', "#2BAB8B"),
    Pair('r', "#FF0000"),
    Pair('s', "#FDA77C"),
    Pair('t', "#00FFCC"),
    Pair('v', "#D557FF"),
    Pair('w', "#FFCC33"),
    Pair('x', "#B2DF2A"),
    Pair('y', "#FFFF00"),
    Pair('z', "#7898D9"),
    Pair('0', "#808080"),
    Pair('1', "#B3B3B3"),
    Pair('2', "#FF3333"),
    Pair('3', "#33CC33"),
    Pair('4', "#6699FF"),
    Pair('5', "#CC9900"),
    Pair('6', "#FF00FF"),
    Pair('7', "#00CCCC"),
    Pair('8', "#FF9900"),
    Pair('9', "#7F33FF"),
)

val blockSpanMap = colorMap.mapValues {
    "<span style=\"color:${it.value}\">${characterBlock(it.key)}</span>"
}

val nonBlockSpanMap = colorMap.mapValues {
    "<span style=\"color:${it.value}\">${it.key}</span>"
}

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
fun main() {
//    val filepath = "/home/eski/anki/decks/español__videojuegos__ff xvi.txt"
    val filepath = "/home/eski/anki/spanishfreq-1-1000-table-anki.txt"
    generateRainbowDecks(filepath)
}

fun generateRainbowDecks(
    deckFilePath: String,
    deckTypes: List<RainbowDeckType> = RainbowDeckType.entries.toList()
) {
    val deckFile = File(deckFilePath)
    val deckRawText = deckFile.readText()
    val deckCards = deckRawText
        .split("\n")

    val rainbowDeckFile = File(
        "${deckFile.parentFile.absolutePath}/" +
                "${deckFile.nameWithoutExtension}-rainbow.${deckFile.extension}"
    )

    val rainbowBlockDeckFile = File(
        "${deckFile.parentFile.absolutePath}/" +
                "${deckFile.nameWithoutExtension}-rainbow-blocks.${deckFile.extension}"
    )
    println("rainbow-deck-path: ${rainbowDeckFile.absolutePath}\n")

    deckTypes.forEach { deckType ->
        val outputFile = File(
            "${deckFile.parentFile.absolutePath}/" +
                    "${deckFile.nameWithoutExtension}-${deckType.name}.${deckFile.extension}"
        )
        val outputText = generateRainbowDeckString(deckCards, deckType)
        outputFile.writeText(outputText)
    }
}

fun generateRainbowDeckString(
    deckCards: List<String>,
    deckType: RainbowDeckType,
): String {
    val rainbowDeckBuilder = StringBuilder()
    deckCards.forEach {
        if (it.startsWith("#") || it.isBlank()) {
            rainbowDeckBuilder.append(it)
        } else {
            val front = it.split("\t")[0]
            val back = it.split("\t")[1]

            rainbowDeckBuilder.append(generateRainbowText(front, deckType.front))
            rainbowDeckBuilder.append("\t")
            rainbowDeckBuilder.append(generateRainbowText(back, deckType.back))
        }

        rainbowDeckBuilder.append("\n")
    }

    return rainbowDeckBuilder.toString()
}

fun generateRainbowText(text: String, format: RainbowDeckType.Format): String {
    if (format == Format.original) return text

    val blocksEnabled = when(format) {
        RainbowDeckType.Format.block -> true
        RainbowDeckType.Format.char -> false
        RainbowDeckType.Format.original -> false
    }

    val rainbowTextBuilder = StringBuilder()
    text.toCharArray().forEach {
        rainbowTextBuilder.append(convertCharToColorSpan(it, blocksEnabled))
    }
    return rainbowTextBuilder.toString()
}

fun convertCharToColorSpan(char: Char, blocksEnabled: Boolean): String {
    val spanMap = if (blocksEnabled) blockSpanMap else nonBlockSpanMap

    return spanMap[char.lowercaseChar()]?.let { span ->
        span
    } ?: char.toString()
}

fun characterBlock(char: Char): Char {
    return if (accentChars.contains(char)) '◪'
    else if (tildeChars.contains(char)) '▤'
    else if (umlautChars.contains(char)) '▥'
    else '■'
}