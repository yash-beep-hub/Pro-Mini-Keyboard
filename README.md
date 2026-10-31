# Pro Mini Keyboard ⌨️📱

A lightweight, high-performance, native Android productivity keyboard (`InputMethodService`) built exclusively for editing, text navigation, and keyboard switching.

![Platform](https://img.shields.io/badge/Platform-Android-green?logo=android)
![Min SDK](https://img.shields.io/badge/Min%20SDK-API%2021%2B-blue)
![Kotlin](https://img.shields.io/badge/Language-Kotlin-purple?logo=kotlin)
![Build](https://img.shields.io/badge/Status-Automated%20Release-brightgreen)

---

## 🎯 Architecture & Layout

Engineered specifically for tablet landscape usage with a 3-panel horizontal distribution:

```
+-------------------+----------------------------+-----------------------+
|  EDITING (25%)    |      SWITCHER (45%)        |   NAVIGATION (30%)    |
+-------------------+----------------------------+-----------------------+
| [ COPY ]          |                            | [SELECT ALL] [PASTE]  |
| [ CUT ]           |                            +-----------------------+
| [ DELETE ]        |     [ SWITCH KEYBOARD ]    | [ ◀ ] [ ▲ ] [ ▼ ] [ ▶ ]|
| [ UNDO ]          |                            +-----------------------+
| [ REDO ]          |                            |       [ ENTER ]       |
+-------------------+----------------------------+-----------------------+
```

### 1. Left Panel (25%) — Editing Controls
- **COPY**: `performContextMenuAction(android.R.id.copy)`
- **CUT**: `performContextMenuAction(android.R.id.cut)`
- **DELETE**: Safe selection replacement or `deleteSurroundingText(1, 0)`
- **UNDO**: Native hardware `KeyEvent.KEYCODE_Z` with `META_CTRL_ON`
- **REDO**: Native hardware `KeyEvent.KEYCODE_Z` with `META_CTRL_ON | META_SHIFT_ON`

### 2. Center Panel (45%) — Fast Switcher
- **SWITCH KEYBOARD**: Triggers `InputMethodManager.showInputMethodPicker()` directly from the main thread.

### 3. Right Panel (30%) — Navigation & Actions
- **SELECT ALL**: `performContextMenuAction(android.R.id.selectAll)`
- **PASTE**: `performContextMenuAction(android.R.id.paste)`
- **ARROWS (◀ ▲ ▼ ▶)**: `sendDownUpKeyEvents(KEYCODE_DPAD_*)` for cursor movements
- **ENTER**: Smart detection of `EditorInfo.imeOptions` (executes single-line IME actions or `KEYCODE_ENTER`)

---

## 🚀 How to Enable

1. Install the APK onto your Android device or emulator.
2. Go to **Settings → System → Languages & input → On-screen keyboard → Manage on-screen keyboards**.
3. Toggle on **Productivity Keyboard**.
4. In any app, switch to **Productivity Keyboard** using the input method switcher.

---

## 📦 Automated Release via GitHub Actions

This repository includes `.github/workflows/build-apk.yml`. Every commit or tag automatically builds the APK and publishes it to GitHub Releases.
