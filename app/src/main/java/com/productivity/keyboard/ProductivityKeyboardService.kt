package com.productivity.keyboard

import android.content.ClipDescription
import android.content.ClipboardManager
import android.graphics.Color
import android.inputmethodservice.InputMethodService
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.util.UUID

/**
 * Productivity Keyboard V2
 * Native Android InputMethodService with Premium UI and Session-Only In-Memory Clipboard Manager.
 */
class ProductivityKeyboardService : InputMethodService() {

    data class ClipboardEntry(
        val id: String = UUID.randomUUID().toString(),
        val text: String,
        var isPinned: Boolean = false,
        var timestamp: Long = System.currentTimeMillis()
    )

    private val clipboardList = mutableListOf<ClipboardEntry>()
    private var selectedEntryId: String? = null
    private var clipboardAdapter: ClipboardAdapter? = null

    private var tvTitle: TextView? = null
    private var rvClipboard: RecyclerView? = null
    private var llEmptyState: LinearLayout? = null
    private var btnClearClipboard: Button? = null
    private var isConfirmingClear = false

    private var clipboardManager: ClipboardManager? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    private val clipChangedListener = ClipboardManager.OnPrimaryClipChangedListener {
        captureClipboardIfAllowed()
    }

    override fun onCreate() {
        super.onCreate()
        clipboardManager = getSystemService(CLIPBOARD_SERVICE) as? ClipboardManager
        try {
            clipboardManager?.addPrimaryClipChangedListener(clipChangedListener)
        } catch (_: Exception) {
            // Gracefully handle restricted environments
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            clipboardManager?.removePrimaryClipChangedListener(clipChangedListener)
        } catch (_: Exception) {
            // Ignore unregister errors
        }
        clipboardList.clear()
        selectedEntryId = null
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        // Check for newly copied text when keyboard view becomes active
        captureClipboardIfAllowed()
    }

    override fun onCreateInputView(): View {
        val keyboardView = layoutInflater.inflate(R.layout.keyboard_view, null)
        initClipboardViews(keyboardView)
        bindEditingButtons(keyboardView)
        bindNavigationButtons(keyboardView)
        updateClipboardUI()
        return keyboardView
    }

    private inline fun withInputConnection(action: (InputConnection) -> Unit) {
        currentInputConnection?.let(action)
    }

    // ------------------------------------------------------------------------
    // Clipboard Management (Session-Only In-Memory)
    // ------------------------------------------------------------------------

    private fun captureClipboardIfAllowed() {
        val cm = clipboardManager ?: return
        try {
            val clip = cm.primaryClip ?: return
            if (clip.itemCount == 0) return

            val description = clip.description
            // Android 13+ (API 33) check for sensitive clipboard flag (e.g. passwords, OTPs)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (description != null && description.extras != null) {
                    val isSensitive = description.extras.getBoolean(ClipDescription.EXTRA_IS_SENSITIVE, false)
                    if (isSensitive) return
                }
            }

            val text = clip.getItemAt(0)?.coerceToText(this)?.toString()
            if (!text.isNullOrBlank()) {
                addClipboardEntry(text)
            }
        } catch (_: Exception) {
            // Gracefully handle any security exceptions
        }
    }

    private fun addClipboardEntry(text: String) {
        // Prevent duplicate spam: if matching text exists, move to top and preserve pinned status
        val existingIndex = clipboardList.indexOfFirst { it.text == text }
        val wasPinned = if (existingIndex != -1) clipboardList[existingIndex].isPinned else false

        if (existingIndex != -1) {
            clipboardList.removeAt(existingIndex)
        } else if (clipboardList.size >= MAX_CLIPBOARD_ENTRIES) {
            // Capacity reached (20 entries). Find oldest unpinned entry.
            val oldestUnpinnedIndex = clipboardList
                .filter { !it.isPinned }
                .minByOrNull { it.timestamp }
                ?.let { unpinned -> clipboardList.indexOf(unpinned) }

            if (oldestUnpinnedIndex != null && oldestUnpinnedIndex != -1) {
                clipboardList.removeAt(oldestUnpinnedIndex)
            } else {
                // All 20 items are pinned: do not silently discard. Warn user.
                Toast.makeText(
                    this,
                    "Clipboard full: Unpin or delete an entry to add more.",
                    Toast.LENGTH_SHORT
                ).show()
                return
            }
        }

        val newEntry = ClipboardEntry(
            text = text,
            isPinned = wasPinned,
            timestamp = System.currentTimeMillis()
        )
        clipboardList.add(newEntry)
        sortClipboardList()
        selectedEntryId = newEntry.id
        updateClipboardUI()
    }

    private fun sortClipboardList() {
        // Pinned entries appear first, then sorted by most recent timestamp
        clipboardList.sortWith(
            compareByDescending<ClipboardEntry> { it.isPinned }
                .thenByDescending { it.timestamp }
        )
    }

    private fun togglePin(entry: ClipboardEntry) {
        entry.isPinned = !entry.isPinned
        sortClipboardList()
        updateClipboardUI()
    }

    private fun deleteEntry(entry: ClipboardEntry) {
        clipboardList.removeAll { it.id == entry.id }
        if (selectedEntryId == entry.id) {
            selectedEntryId = clipboardList.firstOrNull()?.id
        }
        updateClipboardUI()
    }

    private fun clearAllEntries() {
        clipboardList.clear()
        selectedEntryId = null
        updateClipboardUI()
    }

    private fun initClipboardViews(root: View) {
        tvTitle = root.findViewById(R.id.tv_clipboard_title)
        rvClipboard = root.findViewById(R.id.rv_clipboard)
        llEmptyState = root.findViewById(R.id.ll_empty_state)
        btnClearClipboard = root.findViewById(R.id.btn_clear_clipboard)

        clipboardAdapter = ClipboardAdapter(
            items = clipboardList,
            selectedIdProvider = { selectedEntryId },
            onItemClick = { entry ->
                selectedEntryId = entry.id
                withInputConnection { ic ->
                    ic.commitText(entry.text, 1)
                }
                updateClipboardUI()
            },
            onPinClick = { entry ->
                togglePin(entry)
            },
            onDeleteClick = { entry ->
                deleteEntry(entry)
            }
        )

        rvClipboard?.layoutManager = LinearLayoutManager(this)
        rvClipboard?.adapter = clipboardAdapter

        // Clear All with confirmation
        btnClearClipboard?.setOnClickListener {
            if (clipboardList.isEmpty()) return@setOnClickListener

            if (!isConfirmingClear) {
                isConfirmingClear = true
                btnClearClipboard?.text = "CONFIRM?"
                mainHandler.postDelayed({
                    if (isConfirmingClear) {
                        isConfirmingClear = false
                        btnClearClipboard?.text = "CLEAR ALL"
                    }
                }, 3000)
            } else {
                isConfirmingClear = false
                btnClearClipboard?.text = "CLEAR ALL"
                clearAllEntries()
            }
        }

        // Center Switch Keyboard button at bottom
        root.findViewById<Button>(R.id.btn_switch_keyboard)?.setOnClickListener {
            val imm = getSystemService(INPUT_METHOD_SERVICE) as? InputMethodManager
            imm?.showInputMethodPicker()
        }
    }

    private fun updateClipboardUI() {
        val count = clipboardList.size
        tvTitle?.text = "CLIPBOARD ($count/$MAX_CLIPBOARD_ENTRIES)"

        if (clipboardList.isEmpty()) {
            llEmptyState?.visibility = View.VISIBLE
            rvClipboard?.visibility = View.GONE
            btnClearClipboard?.visibility = View.GONE
        } else {
            llEmptyState?.visibility = View.GONE
            rvClipboard?.visibility = View.VISIBLE
            btnClearClipboard?.visibility = View.VISIBLE
        }

        clipboardAdapter?.notifyDataSetChanged()
    }

    // ------------------------------------------------------------------------
    // Left Panel: Editing Controls (Preserved Working Logic)
    // ------------------------------------------------------------------------

    private fun bindEditingButtons(view: View) {
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
    }

    // ------------------------------------------------------------------------
    // Right Panel: Navigation Controls (Preserved Working Logic + Smart Paste)
    // ------------------------------------------------------------------------

    private fun bindNavigationButtons(view: View) {
        view.findViewById<Button>(R.id.btn_select_all)?.setOnClickListener {
            withInputConnection { ic ->
                ic.performContextMenuAction(android.R.id.selectAll)
            }
        }

        // Paste button: uses selected clipboard item, or newest, or normal context menu paste
        view.findViewById<Button>(R.id.btn_paste)?.setOnClickListener {
            val selectedItem = clipboardList.find { it.id == selectedEntryId }
            val itemToPaste = selectedItem ?: clipboardList.firstOrNull()

            if (itemToPaste != null) {
                withInputConnection { ic ->
                    ic.commitText(itemToPaste.text, 1)
                }
            } else {
                // Fall back to standard Android system paste
                withInputConnection { ic ->
                    ic.performContextMenuAction(android.R.id.paste)
                }
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

    // ------------------------------------------------------------------------
    // RecyclerView Adapter for Clipboard Items
    // ------------------------------------------------------------------------

    private class ClipboardAdapter(
        private val items: List<ClipboardEntry>,
        private val selectedIdProvider: () -> String?,
        private val onItemClick: (ClipboardEntry) -> Unit,
        private val onPinClick: (ClipboardEntry) -> Unit,
        private val onDeleteClick: (ClipboardEntry) -> Unit
    ) : RecyclerView.Adapter<ClipboardAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val root: View = view.findViewById(R.id.item_root)
            val tvText: TextView = view.findViewById(R.id.tv_clipboard_text)
            val btnPin: TextView = view.findViewById(R.id.btn_item_pin)
            val btnDelete: TextView = view.findViewById(R.id.btn_item_delete)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_clipboard, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            val isSelected = (item.id == selectedIdProvider())

            holder.tvText.text = item.text

            // Highlight selected item, pinned item, or default
            when {
                isSelected -> holder.root.setBackgroundResource(R.drawable.bg_clipboard_item_selected)
                item.isPinned -> holder.root.setBackgroundResource(R.drawable.bg_clipboard_item_pinned)
                else -> holder.root.setBackgroundResource(R.drawable.bg_clipboard_item)
            }

            // Pin state styling
            if (item.isPinned) {
                holder.btnPin.text = "★"
                holder.btnPin.setTextColor(Color.parseColor("#38BDF8"))
            } else {
                holder.btnPin.text = "☆"
                holder.btnPin.setTextColor(Color.parseColor("#64748B"))
            }

            holder.root.setOnClickListener {
                onItemClick(item)
            }

            holder.btnPin.setOnClickListener {
                onPinClick(item)
            }

            holder.btnDelete.setOnClickListener {
                onDeleteClick(item)
            }
        }

        override fun getItemCount(): Int = items.size
    }

    companion object {
        private const val MAX_CLIPBOARD_ENTRIES = 20
    }
}
