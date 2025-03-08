package org.eski

import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

fun main() {
  generateJsStrings()
}

fun generateJsStrings() {
  generateJsString(0, 999)
}

fun generateJsString(firstWordIndex: Int, lastWordIndex: Int) {
  val stringBuilder = StringBuilder()
  stringBuilder.append("\tconst wordsList = [")
  val fileName = "google-10000-english-usa-no-swears.txt"

  try {
    val lines = Files.readAllLines(Paths.get(fileName))
    var currentLineLength = 0

    lines.forEachIndexed { index, line ->
      if (index in firstWordIndex..lastWordIndex) {
        currentLineLength += line.length + 4

        if (currentLineLength > 100 || index == firstWordIndex) {
          stringBuilder.append("\n\t\t")
          currentLineLength = line.length
        }
        stringBuilder.append("\"")
        stringBuilder.append(line)
        stringBuilder.append("\"")
        if (index != lastWordIndex) stringBuilder.append(", ")
      }
    }
  } catch (e: IOException) {
    e.printStackTrace()
  }
  stringBuilder.append("\n\t]")
  print(stringBuilder.toString())
}