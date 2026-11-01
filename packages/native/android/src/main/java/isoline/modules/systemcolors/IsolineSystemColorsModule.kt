package isoline.modules.systemcolors

import android.annotation.TargetApi
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The device's Material You tonal palettes — the colors Android 12+ derives
 * from the wallpaper (or the user's chosen theme) and hands to every app that
 * asks, which is where Gmail and the system apps get their colors from.
 *
 * Only the raw palettes cross the bridge. Which tone of which palette plays
 * which role is decided in `src/dynamic-color.ts`, where it can be tested
 * and changed over the air.
 */
class IsolineSystemColorsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IsolineSystemColors")

    // Synchronous: a handful of resource lookups, and the first frame needs
    // the answer to paint in the right colors rather than flash the default.
    Function("getPalette") {
      val context = appContext.reactContext ?: return@Function null
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return@Function null
      readPalette(context)
    }
  }

  @TargetApi(Build.VERSION_CODES.S)
  private fun readPalette(context: Context): Map<String, List<String>> = mapOf(
    "accent1" to tones(context, ACCENT1),
    "accent2" to tones(context, ACCENT2),
    "accent3" to tones(context, ACCENT3),
    "neutral1" to tones(context, NEUTRAL1),
    "neutral2" to tones(context, NEUTRAL2),
  )

  private fun tones(context: Context, ids: IntArray): List<String> =
    ids.map { id -> String.format("#%06X", 0xFFFFFF and context.getColor(id)) }

  private companion object {
    // Each palette in the order of its stops: _0 (tone 100, white) through
    // _1000 (tone 0, black). `PALETTE_TONES` in `src/dynamic-color.ts`
    // mirrors this order.
    val ACCENT1 = intArrayOf(
      android.R.color.system_accent1_0,
      android.R.color.system_accent1_10,
      android.R.color.system_accent1_50,
      android.R.color.system_accent1_100,
      android.R.color.system_accent1_200,
      android.R.color.system_accent1_300,
      android.R.color.system_accent1_400,
      android.R.color.system_accent1_500,
      android.R.color.system_accent1_600,
      android.R.color.system_accent1_700,
      android.R.color.system_accent1_800,
      android.R.color.system_accent1_900,
      android.R.color.system_accent1_1000,
    )
    val ACCENT2 = intArrayOf(
      android.R.color.system_accent2_0,
      android.R.color.system_accent2_10,
      android.R.color.system_accent2_50,
      android.R.color.system_accent2_100,
      android.R.color.system_accent2_200,
      android.R.color.system_accent2_300,
      android.R.color.system_accent2_400,
      android.R.color.system_accent2_500,
      android.R.color.system_accent2_600,
      android.R.color.system_accent2_700,
      android.R.color.system_accent2_800,
      android.R.color.system_accent2_900,
      android.R.color.system_accent2_1000,
    )
    val ACCENT3 = intArrayOf(
      android.R.color.system_accent3_0,
      android.R.color.system_accent3_10,
      android.R.color.system_accent3_50,
      android.R.color.system_accent3_100,
      android.R.color.system_accent3_200,
      android.R.color.system_accent3_300,
      android.R.color.system_accent3_400,
      android.R.color.system_accent3_500,
      android.R.color.system_accent3_600,
      android.R.color.system_accent3_700,
      android.R.color.system_accent3_800,
      android.R.color.system_accent3_900,
      android.R.color.system_accent3_1000,
    )
    val NEUTRAL1 = intArrayOf(
      android.R.color.system_neutral1_0,
      android.R.color.system_neutral1_10,
      android.R.color.system_neutral1_50,
      android.R.color.system_neutral1_100,
      android.R.color.system_neutral1_200,
      android.R.color.system_neutral1_300,
      android.R.color.system_neutral1_400,
      android.R.color.system_neutral1_500,
      android.R.color.system_neutral1_600,
      android.R.color.system_neutral1_700,
      android.R.color.system_neutral1_800,
      android.R.color.system_neutral1_900,
      android.R.color.system_neutral1_1000,
    )
    val NEUTRAL2 = intArrayOf(
      android.R.color.system_neutral2_0,
      android.R.color.system_neutral2_10,
      android.R.color.system_neutral2_50,
      android.R.color.system_neutral2_100,
      android.R.color.system_neutral2_200,
      android.R.color.system_neutral2_300,
      android.R.color.system_neutral2_400,
      android.R.color.system_neutral2_500,
      android.R.color.system_neutral2_600,
      android.R.color.system_neutral2_700,
      android.R.color.system_neutral2_800,
      android.R.color.system_neutral2_900,
      android.R.color.system_neutral2_1000,
    )
  }
}
