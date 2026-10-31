# Pro-Mini-Keyboard ⌨️📱

A lightweight, native Android productivity keyboard (`InputMethodService`) built in Kotlin for landscape tablet and phone workflows.

This keyboard is dedicated strictly to text manipulation, cursor navigation, and fast keyboard switching—free from typing keys, analytics, or background bloat.

[![Build and Release Android APK](https://github.com/yashclashofclan0008/Pro-Mini-Keyboard/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/yashclashofclan0008/Pro-Mini-Keyboard/actions/workflows/build-and-release.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## 🚀 Features

- **Editing Panel (25%)**:
  - `COPY` — `currentInputConnection.performContextMenuAction(android.R.id.copy)`
  - `CUT` — `currentInputConnection.performContextMenuAction(android.R.id.cut)`
  - `DELETE` — Smart deletion: replaces selection with empty string via `commitText()` or deletes preceding character via `deleteSurroundingText(1, 0)`
  - `UNDO` — Emits `KeyEvent.KEYCODE_Z` with `KeyEvent.META_CTRL_ON`
  - `REDO` — Emits `KeyEvent.KEYCODE_Z` with `KeyEvent.META_CTRL_ON | KeyEvent.META_SHIFT_ON`
- **Center IME Switcher (45%)**:
  - Prominent full-height button triggering `InputMethodManager.showInputMethodPicker()` to quickly switch back to your QWERTY keyboard.
- **Navigation Panel (30%)**:
  - `SELECT ALL` — `currentInputConnection.performContextMenuAction(android.R.id.selectAll)`
  - `PASTE` — `currentInputConnection.performContextMenuAction(android.R.id.paste)`
  - `DPAD Arrows` — `sendDownUpKeyEvents(KEYCODE_DPAD_LEFT / RIGHT / UP / DOWN)` for fluid caret movement
  - `ENTER` — Context-aware: triggers `sendDefaultEditorAction(true)` on single-line actions or sends `KEYCODE_ENTER`
- **Zero Overhead**:
  - No typing keys, no clipboard database, no network calls, zero sound effects, zero haptic latency.

---

## 📦 Download APK

Directly download the ready-to-install APK from the **[Releases](https://github.com/yashclashofclan0008/Pro-Mini-Keyboard/releases)** page:
- `Pro-Mini-Keyboard-v1.0.0.apk`

---

## 🛠️ Build Locally

```bash
git clone https://github.com/yashclashofclan0008/Pro-Mini-Keyboard.git
cd Pro-Mini-Keyboard
./gradlew assembleDebug
```

The APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

Install via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚙️ Enabling on Android

1. Open **Settings** on your Android device.
2. Go to **System** → **Languages & input** → **On-screen keyboard** → **Manage on-screen keyboards**.
3. Enable **Productivity Keyboard**.
4. In any text area, open the keyboard switcher and choose **Productivity Keyboard**.
