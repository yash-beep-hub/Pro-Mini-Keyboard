package com.productivity.keyboard

import android.inputmethodservice.InputMethodService
import android.os.SystemClock
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.view.inputmethod.InputMethodManager
import android.widget.Button

class ProductivityKeyboardService : InputMethodService() {

    override fun onCreateInputView(): View {
        val keyboardView = layoutInflater.inflate(R.layout.keyboard_view, null)
        bindListeners(keyboardView)
        return keyboardView
    }

    private inline fun withInputConnection(action: (InputConnection) -> Unit) {
        currentInputConnection?.let(action)
    }

    private fun bindListeners(view: View) {
        // Left Panel: Editing Controls
        view.findViewById<Button>(R.id.btn_copy)?.setOnClickListener {
            withInputConnection { ic ->
                ic.performContextMenuAction(android.R.id.copy)
            }
        }

        view.findViewById<Button>(R.id.btn_cut)?.setOnClickListener {
            withInputConnection { ic ->
                ic.performContextMenuAction(android.R.id.cut)
            }
        }

        view.findViewById<Button>(R.id.btn_delete)?.setOnClickListener {
            withInputConnection { ic ->
                val selectedText = ic.getSelectedText(0)
                if (!selectedText.isNullOrEmpty()) {
                    ic.commitText("", 1)
                } else {
                    ic.deleteSurroundingText(1, 0)
                }
            }
        }

        view.findViewById<Button>(R.id.btn_undo)?.setOnClickListener {
            withInputConnection { ic ->
                val now = SystemClock.uptimeMillis()
                val meta = KeyEvent.META_CTRL_ON
                val downEvent = KeyEvent(now, now, KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_Z, 0, meta)
                val upEvent = KeyEvent(now, now, KeyEvent.ACTION_UP, KeyEvent.KEYCODE_Z, 0, meta)
                ic.sendKeyEvent(downEvent)
                ic.sendKeyEvent(upEvent)
            }
        }

        view.findViewById<Button>(R.id.btn_redo)?.setOnClickListener {
            withInputConnection { ic ->
                val now = SystemClock.uptimeMillis()
                val meta = KeyEvent.META_CTRL_ON or KeyEvent.META_SHIFT_ON
                val downEvent = KeyEvent(now, now, KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_Z, 0, meta)
                val upEvent = KeyEvent(now, now, KeyEvent.ACTION_UP, KeyEvent.KEYCODE_Z, 0, meta)
                ic.sendKeyEvent(downEvent)
                ic.sendKeyEvent(upEvent)
            }
        }

        // Center Panel: Keyboard Switching
        view.findViewById<Button>(R.id.btn_switch_keyboard)?.setOnClickListener {
            val imm = getSystemService(INPUT_METHOD_SERVICE) as? InputMethodManager
            imm?.showInputMethodPicker()
        }

        // Right Panel: Navigation & Actions
        view.findViewById<Button>(R.id.btn_select_all)?.setOnClickListener {
            withInputConnection { ic ->
                ic.performContextMenuAction(android.R.id.selectAll)
            }
        }

        view.findViewById<Button>(R.id.btn_paste)?.setOnClickListener {
            withInputConnection { ic ->
                ic.performContextMenuAction(android.R.id.paste)
            }
        }

        view.findViewById<Button>(R.id.btn_arrow_left)?.setOnClickListener {
            sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_LEFT)
        }

        view.findViewById<Button>(R.id.btn_arrow_up)?.setOnClickListener {
            sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_UP)
        }

        view.findViewById<Button>(R.id.btn_arrow_down)?.setOnClickListener {
            sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_DOWN)
        }

        view.findViewById<Button>(R.id.btn_arrow_right)?.setOnClickListener {
            sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_RIGHT)
        }

        view.findViewById<Button>(R.id.btn_enter)?.setOnClickListener {
            val info = currentInputEditorInfo
            val imeAction = info?.imeOptions?.and(EditorInfo.IME_MASK_ACTION) ?: EditorInfo.IME_ACTION_NONE
            val isSingleLine = info?.inputType?.and(EditorInfo.TYPE_TEXT_FLAG_MULTI_LINE) == 0
            val hasAction = imeAction != EditorInfo.IME_ACTION_NONE && imeAction != EditorInfo.IME_ACTION_UNSPECIFIED

            if (isSingleLine && hasAction) {
                sendDefaultEditorAction(true)
            } else {
                sendDownUpKeyEvents(KeyEvent.KEYCODE_ENTER)
            }
        }
    }
}
