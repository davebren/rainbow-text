package org.rainbow

import java.io.File


fun main() {
//    val filepath = "/home/eski/anki/esp-freq/spanishfreq-1001-2000.txt"
//    generateDeck(filepath)

    val start = 1
    for (i in 1 until 9) {
        val startIndex = start + i * 1000
        val endIndex = startIndex + 999
        val parent = "/home/eski/anki/esp-freq"
        val filename = "spanishfreq-$startIndex-$endIndex"
        val path = "$parent/$filename.txt"

        println(path)
        val deckFile = generateDeck(path)

        generateRainbowDecks(
            deckFilePath = deckFile.absolutePath,
            deckTypes = listOf(RainbowDeckType.blockToChar)
        )
    }
}

fun generateDeck(filepath: String): File {
    val tableFile = File(filepath)

    val tableText = tableFile.readText()
    val lines = tableText.split("\n")

    val deckStringBuilder = StringBuilder()
    deckStringBuilder.appendLine("#separator:tab")
    deckStringBuilder.appendLine("#html:true")

    var skipNext = false
    lines.forEachIndexed { index, line ->
        if (line.contains("</a>")) {
            if (skipNext) { // Skip lemmas.
                skipNext = false
                return@forEachIndexed
            }

            val word = line.removeSuffix("</a>").substringAfterLast(">")
            deckStringBuilder.appendLine("$word\t$word")
            skipNext = true
        }
    }

    val rainbowDeckFile = File(
        "${tableFile.parentFile.absolutePath}/" +
                "${tableFile.nameWithoutExtension}-anki.txt"
    )
    rainbowDeckFile.writeText(deckStringBuilder.toString())
    return rainbowDeckFile
}