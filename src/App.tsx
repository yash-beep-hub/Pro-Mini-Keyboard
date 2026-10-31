import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Copy, 
  Scissors, 
  Trash2, 
  Undo2, 
  Redo2, 
  Globe, 
  CheckSquare, 
  Clipboard, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  CornerDownLeft, 
  FileCode, 
  Check, 
  Layers, 
  Smartphone, 
  BookOpen,
  Info,
  Github,
  Download,
  Terminal,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

const MANIFEST_CODE = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.productivity.keyboard">

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="Productivity Keyboard"
        android:supportsRtl="true">

        <service
            android:name=".ProductivityKeyboardService"
            android:exported="true"
            android:label="Productivity Keyboard"
            android:permission="android.permission.BIND_INPUT_METHOD">
            <intent-filter>
                <action android:name="android.view.InputMethod" />
            </intent-filter>
            <meta-data
                android:name="android.view.im"
                android:resource="@xml/method" />
        </service>

    </application>

</manifest>`;

const METHOD_XML_CODE = `<?xml version="1.0" encoding="utf-8"?>
<input-method xmlns:android="http://schemas.android.com/apk/res/android" />`;

const KEYBOARD_VIEW_XML_CODE = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/keyboard_root"
    android:layout_width="match_parent"
    android:layout_height="220dp"
    android:orientation="horizontal"
    android:baselineAligned="false"
    android:weightSum="100"
    android:padding="6dp"
    android:background="#1E1E24"
    android:soundEffectsEnabled="false"
    android:hapticFeedbackEnabled="false">

    <!-- LEFT PANEL: EDITING (25%) -->
    <LinearLayout
        android:id="@+id/panel_editing"
        android:layout_width="0dp"
        android:layout_height="match_parent"
        android:layout_weight="25"
        android:orientation="vertical"
        android:padding="2dp">

        <Button
            android:id="@+id/btn_copy"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:layout_margin="2dp"
            android:text="COPY"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:contentDescription="Copy"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />

        <Button
            android:id="@+id/btn_cut"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:layout_margin="2dp"
            android:text="CUT"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:contentDescription="Cut"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />

        <Button
            android:id="@+id/btn_delete"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:layout_margin="2dp"
            android:text="DELETE"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:contentDescription="Delete"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />

        <Button
            android:id="@+id/btn_undo"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:layout_margin="2dp"
            android:text="UNDO"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:contentDescription="Undo"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />

        <Button
            android:id="@+id/btn_redo"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:layout_margin="2dp"
            android:text="REDO"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:contentDescription="Redo"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />
    </LinearLayout>

    <!-- CENTER PANEL: KEYBOARD SWITCHING (45%) -->
    <LinearLayout
        android:id="@+id/panel_center"
        android:layout_width="0dp"
        android:layout_height="match_parent"
        android:layout_weight="45"
        android:orientation="vertical"
        android:gravity="center"
        android:padding="4dp">

        <Button
            android:id="@+id/btn_switch_keyboard"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_margin="6dp"
            android:text="SWITCH KEYBOARD"
            android:textColor="#FFFFFF"
            android:textSize="16sp"
            android:textStyle="bold"
            android:contentDescription="Switch Keyboard"
            android:soundEffectsEnabled="false"
            android:hapticFeedbackEnabled="false" />
    </LinearLayout>

    <!-- RIGHT PANEL: NAVIGATION (30%) -->
    <LinearLayout
        android:id="@+id/panel_navigation"
        android:layout_width="0dp"
        android:layout_height="match_parent"
        android:layout_weight="30"
        android:orientation="vertical"
        android:padding="2dp">

        <!-- Top row: Select All & Paste -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:orientation="horizontal">

            <Button
                android:id="@+id/btn_select_all"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="SELECT ALL"
                android:textColor="#FFFFFF"
                android:textSize="11sp"
                android:contentDescription="Select All"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />

            <Button
                android:id="@+id/btn_paste"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="PASTE"
                android:textColor="#FFFFFF"
                android:textSize="11sp"
                android:contentDescription="Paste"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />
        </LinearLayout>

        <!-- Arrow keys row: Left, Up, Down, Right -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:orientation="horizontal">

            <Button
                android:id="@+id/btn_arrow_left"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="&#x25C0;"
                android:textColor="#FFFFFF"
                android:textSize="16sp"
                android:contentDescription="Arrow Left"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />

            <Button
                android:id="@+id/btn_arrow_up"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="&#x25B2;"
                android:textColor="#FFFFFF"
                android:textSize="16sp"
                android:contentDescription="Arrow Up"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />

            <Button
                android:id="@+id/btn_arrow_down"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="&#x25BC;"
                android:textColor="#FFFFFF"
                android:textSize="16sp"
                android:contentDescription="Arrow Down"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />

            <Button
                android:id="@+id/btn_arrow_right"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_weight="1"
                android:layout_margin="2dp"
                android:text="&#x25B6;"
                android:textColor="#FFFFFF"
                android:textSize="16sp"
                android:contentDescription="Arrow Right"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />
        </LinearLayout>

        <!-- Bottom row: Enter -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1"
            android:orientation="horizontal">

            <Button
                android:id="@+id/btn_enter"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:layout_margin="2dp"
                android:text="ENTER"
                android:textColor="#FFFFFF"
                android:textSize="13sp"
                android:contentDescription="Enter"
                android:soundEffectsEnabled="false"
                android:hapticFeedbackEnabled="false" />
        </LinearLayout>

    </LinearLayout>

</LinearLayout>`;

const KOTLIN_CODE = `package com.productivity.keyboard

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
}`;

const WORKFLOW_CODE = `name: Build and Release Android APK

on:
  push:
    branches: [ "main", "master" ]
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build APK & Create Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Build Debug & Release APK
        run: |
          chmod +x gradlew || true
          if [ -f "./gradlew" ]; then
            ./gradlew assembleDebug --stacktrace
          else
            gradle assembleDebug --stacktrace
          fi

      - name: Locate Generated APK
        id: apk_location
        run: |
          APK_PATH=$(find app/build/outputs/apk/debug/ -name "*.apk" 2>/dev/null | head -n 1)
          if [ -z "$APK_PATH" ]; then
            APK_PATH=$(find . -name "*.apk" | head -n 1)
          fi
          echo "Found APK at: $APK_PATH"
          echo "apk_path=$APK_PATH" >> $GITHUB_OUTPUT
          cp "$APK_PATH" Pro-Mini-Keyboard-v1.0.0.apk
          echo "release_apk=Pro-Mini-Keyboard-v1.0.0.apk" >> $GITHUB_OUTPUT

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Pro-Mini-Keyboard-APK
          path: Pro-Mini-Keyboard-v1.0.0.apk
          if-no-files-found: error

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        with:
          tag_name: \${{ github.ref_name || 'v1.0.0' }}
          name: Pro-Mini-Keyboard \${{ github.ref_name || 'v1.0.0' }}
          body: |
            ## 📱 Pro-Mini-Keyboard Release
            
            Minimal, lightweight, native Android productivity keyboard (\`InputMethodService\`).
            
            ### ✨ Features
            - **Editing Controls (25%)**: Copy, Cut, Delete (with smart selection replacement), Undo (Ctrl+Z), Redo (Ctrl+Shift+Z)
            - **IME Switcher (45%)**: Prominent system \`InputMethodManager\` picker trigger
            - **Navigation & Actions (30%)**: Select All, Paste, DPAD Navigation (◀ ▲ ▼ ▶), Context-aware Enter
            - **Zero Bloat**: No typing keys, no clipboard database, no network calls, zero haptic/audio overhead
            
            ### 📥 Download & Install
            Download **\`Pro-Mini-Keyboard-v1.0.0.apk\`** below and install it directly on your Android device or tablet!
          draft: false
          prerelease: false
          files: Pro-Mini-Keyboard-v1.0.0.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

const APP_BUILD_GRADLE = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.productivity.keyboard'
    compileSdk 34

    defaultConfig {
        applicationId "com.productivity.keyboard"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
}`;

const ROOT_BUILD_GRADLE = `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}`;

const SETTINGS_GRADLE = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Pro-Mini-Keyboard"
include ':app'`;

const GRADLE_PROPERTIES = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'release' | 'files' | 'setup'>('release');
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [repoName, setRepoName] = useState<string>("Pro-Mini-Keyboard");
  const [gitUsername, setGitUsername] = useState<string>("yashclashofclan0008");
  
  // Interactive Simulator state
  const [editorText, setEditorText] = useState<string>(
    "Welcome to the Pro-Mini-Keyboard Android project!\n\nThis landscape tablet keyboard is engineered purely for text editing, cursor navigation, and fast switching—without any distracting QWERTY typing keys.\n\nTry selecting text, cutting, pasting, undoing changes, or using arrow keys below."
  );
  const [history, setHistory] = useState<string[]>([
    "Welcome to the Pro-Mini-Keyboard Android project!\n\nThis landscape tablet keyboard is engineered purely for text editing, cursor navigation, and fast switching—without any distracting QWERTY typing keys.\n\nTry selecting text, cutting, pasting, undoing changes, or using arrow keys below."
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [clipboard, setClipboard] = useState<string>("Productivity keyboard ready.");
  const [statusMessage, setStatusMessage] = useState<string>("Keyboard ready. Click buttons to simulate native IME actions.");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const files = [
    {
      name: "AndroidManifest.xml",
      path: "app/src/main/AndroidManifest.xml",
      code: MANIFEST_CODE,
      lang: "xml"
    },
    {
      name: "method.xml",
      path: "app/src/main/res/xml/method.xml",
      code: METHOD_XML_CODE,
      lang: "xml"
    },
    {
      name: "keyboard_view.xml",
      path: "app/src/main/res/layout/keyboard_view.xml",
      code: KEYBOARD_VIEW_XML_CODE,
      lang: "xml"
    },
    {
      name: "ProductivityKeyboardService.kt",
      path: "app/src/main/java/com/productivity/keyboard/ProductivityKeyboardService.kt",
      code: KOTLIN_CODE,
      lang: "kotlin"
    },
    {
      name: "build-and-release.yml (CI/CD APK)",
      path: ".github/workflows/build-and-release.yml",
      code: WORKFLOW_CODE,
      lang: "yaml"
    },
    {
      name: "app/build.gradle",
      path: "app/build.gradle",
      code: APP_BUILD_GRADLE,
      lang: "gradle"
    },
    {
      name: "root build.gradle",
      path: "build.gradle",
      code: ROOT_BUILD_GRADLE,
      lang: "gradle"
    },
    {
      name: "settings.gradle",
      path: "settings.gradle",
      code: SETTINGS_GRADLE,
      lang: "gradle"
    }
  ];

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add project files to ZIP
      zip.file("README.md", `# Pro-Mini-Keyboard ⌨️📱\n\nMinimal, lightweight native Android productivity keyboard (InputMethodService).\n\nBuilt with horizontal 3-panel architecture (Editing 25%, IME Switcher 45%, Navigation 30%).\n`);
      zip.file("build.gradle", ROOT_BUILD_GRADLE);
      zip.file("settings.gradle", SETTINGS_GRADLE);
      zip.file("gradle.properties", GRADLE_PROPERTIES);
      
      // GitHub Action
      const githubWorkflowFolder = zip.folder(".github")?.folder("workflows");
      githubWorkflowFolder?.file("build-and-release.yml", WORKFLOW_CODE);

      // App folder
      const appFolder = zip.folder("app");
      appFolder?.file("build.gradle", APP_BUILD_GRADLE);

      // Main src
      const mainFolder = appFolder?.folder("src")?.folder("main");
      mainFolder?.file("AndroidManifest.xml", MANIFEST_CODE);

      // res
      const resFolder = mainFolder?.folder("res");
      resFolder?.folder("xml")?.file("method.xml", METHOD_XML_CODE);
      resFolder?.folder("layout")?.file("keyboard_view.xml", KEYBOARD_VIEW_XML_CODE);

      // kotlin service
      const ktFolder = mainFolder?.folder("java")?.folder("com")?.folder("productivity")?.folder("keyboard");
      ktFolder?.file("ProductivityKeyboardService.kt", KOTLIN_CODE);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pro-Mini-Keyboard-Android-Project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  const updateHistory = (newText: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditorText(newText);
  };

  // Keyboard Simulation handlers
  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setStatusMessage("Executed: performContextMenuAction(android.R.id.selectAll)");
    }
  };

  const handleCopy = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selected = editorText.substring(start, end);
        setClipboard(selected);
        setStatusMessage(`Executed: performContextMenuAction(android.R.id.copy) [${selected.length} chars]`);
      } else {
        setStatusMessage("Copy executed (no selection)");
      }
      textareaRef.current.focus();
    }
  };

  const handleCut = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selected = editorText.substring(start, end);
        setClipboard(selected);
        const newText = editorText.substring(0, start) + editorText.substring(end);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start;
            textareaRef.current.selectionEnd = start;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage(`Executed: performContextMenuAction(android.R.id.cut) [${selected.length} chars]`);
      } else {
        setStatusMessage("Cut executed (no selection)");
      }
    }
  };

  const handlePaste = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = editorText.substring(0, start) + clipboard + editorText.substring(end);
      updateHistory(newText);
      const newPos = start + clipboard.length;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          textareaRef.current.focus();
        }
      }, 0);
      setStatusMessage(`Executed: performContextMenuAction(android.R.id.paste) [pasted "${clipboard.slice(0, 20)}..."]`);
    }
  };

  const handleDelete = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const newText = editorText.substring(0, start) + editorText.substring(end);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start;
            textareaRef.current.selectionEnd = start;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage("Executed: commitText(\"\", 1) on selected text");
      } else if (start > 0) {
        const newText = editorText.substring(0, start - 1) + editorText.substring(start);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start - 1;
            textareaRef.current.selectionEnd = start - 1;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage("Executed: deleteSurroundingText(1, 0)");
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setEditorText(history[nextIndex]);
      setStatusMessage("Executed: KeyEvent KEYCODE_Z with META_CTRL_ON (Undo)");
    } else {
      setStatusMessage("Undo: beginning of edit history");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEditorText(history[nextIndex]);
      setStatusMessage("Executed: KeyEvent KEYCODE_Z with META_CTRL_ON | META_SHIFT_ON (Redo)");
    } else {
      setStatusMessage("Redo: latest edit");
    }
  };

  const handleArrow = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    let pos = el.selectionStart;
    
    if (direction === 'left') {
      pos = Math.max(0, pos - 1);
      el.setSelectionRange(pos, pos);
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_LEFT)");
    } else if (direction === 'right') {
      pos = Math.min(editorText.length, pos + 1);
      el.setSelectionRange(pos, pos);
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_RIGHT)");
    } else if (direction === 'up') {
      const prevLineBreak = editorText.lastIndexOf('\n', pos - 1);
      if (prevLineBreak !== -1) {
        const lineBeforeBreak = editorText.lastIndexOf('\n', prevLineBreak - 1);
        const col = pos - prevLineBreak;
        const targetLineStart = lineBeforeBreak === -1 ? 0 : lineBeforeBreak + 1;
        const newPos = Math.min(targetLineStart + col, prevLineBreak);
        el.setSelectionRange(newPos, newPos);
      } else {
        el.setSelectionRange(0, 0);
      }
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_UP)");
    } else if (direction === 'down') {
      const nextLineBreak = editorText.indexOf('\n', pos);
      if (nextLineBreak !== -1) {
        const prevLineBreak = editorText.lastIndexOf('\n', pos - 1);
        const col = pos - (prevLineBreak === -1 ? 0 : prevLineBreak + 1);
        const lineAfterNext = editorText.indexOf('\n', nextLineBreak + 1);
        const targetLineEnd = lineAfterNext === -1 ? editorText.length : lineAfterNext;
        const newPos = Math.min(nextLineBreak + 1 + col, targetLineEnd);
        el.setSelectionRange(newPos, newPos);
      } else {
        el.setSelectionRange(editorText.length, editorText.length);
      }
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_DOWN)");
    }
  };

  const handleEnter = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = editorText.substring(0, start) + "\n" + editorText.substring(end);
      updateHistory(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
          textareaRef.current.focus();
        }
      }, 0);
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_ENTER)");
    }
  };

  const handleSwitchKeyboard = () => {
    setStatusMessage("Executed: InputMethodManager.showInputMethodPicker() (Opens system IME dialog)");
  };

  const gitPushCommands = `git init
git add .
git commit -m "Initial release of Pro-Mini-Keyboard v1.0.0"
git branch -M main
git remote add origin https://github.com/${gitUsername}/${repoName}.git
git push -u origin main`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              Pro-Mini-Keyboard
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Android InputMethodService &bull; Repo: <code className="text-slate-300 font-mono">{repoName}</code>
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Packaging ZIP...' : 'Download Project ZIP'}
          </button>

          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab('release')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'release'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-indigo-400" />
              GitHub &amp; APK
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Simulator
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'files'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'setup'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Setup Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {activeTab === 'release' && (
          <div className="space-y-6">
            {/* Banner card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <PackageCheck className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    GitHub Automated Release &amp; APK
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Release Pro-Mini-Keyboard on GitHub with automated APK build
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We've configured the complete Android project with a native <strong>GitHub Actions CI/CD workflow</strong> (<code>.github/workflows/build-and-release.yml</code>). When you push the project to your GitHub repository, GitHub's build runners will automatically compile the APK and publish the release with downloadable APK assets!
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download Ready-to-Push ZIP
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Git Command Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      1. Push to GitHub Repo
                    </div>
                    <button
                      onClick={() => handleCopyCode(gitPushCommands, 999)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 border border-slate-700"
                    >
                      {copiedIndex === 999 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Commands</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    Create a new empty repo named <strong className="text-slate-200">Pro-Mini-Keyboard</strong> on your GitHub account, then run these commands inside your project folder:
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">GitHub Username:</span>
                    <input
                      type="text"
                      value={gitUsername}
                      onChange={(e) => setGitUsername(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none w-48"
                      placeholder="username"
                    />
                  </div>

                  <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{gitPushCommands}</code>
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  Target repo URL: <code className="text-slate-300">https://github.com/{gitUsername}/{repoName}</code>
                </div>
              </div>

              {/* Automated APK Delivery */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                    <Github className="w-4 h-4 text-indigo-400" />
                    2. Automated GitHub Actions APK Pipeline
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    The included workflow file <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">.github/workflows/build-and-release.yml</code> executes automatically on every push:
                  </p>

                  <ul className="space-y-3 text-xs text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        A
                      </div>
                      <span>
                        <strong className="text-slate-200">Cloud Build Runner:</strong> Spins up an Ubuntu instance with Java 17 and Android SDK build tools.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        B
                      </div>
                      <span>
                        <strong className="text-slate-200">Compiles APK:</strong> Runs <code className="text-slate-300 font-mono">./gradlew assembleDebug</code> to generate <code className="text-slate-300 font-mono">Pro-Mini-Keyboard-v1.0.0.apk</code>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        C
                      </div>
                      <span>
                        <strong className="text-slate-200">Publishes GitHub Release:</strong> Automatically creates a release under <code className="text-slate-300 font-mono">Releases</code> and uploads the APK file for public download.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Artifact asset name:</span>
                  <span className="text-emerald-400 font-mono font-medium">Pro-Mini-Keyboard-v1.0.0.apk</span>
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Repository Contents in Pro-Mini-Keyboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="text-indigo-400 font-semibold mb-1">Android Application Core</div>
                  <div>├── app/src/main/AndroidManifest.xml</div>
                  <div>├── app/src/main/res/xml/method.xml</div>
                  <div>├── app/src/main/res/layout/keyboard_view.xml</div>
                  <div>└── app/src/main/java/com/productivity/keyboard/ProductivityKeyboardService.kt</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="text-indigo-400 font-semibold mb-1">Build &amp; GitHub Release System</div>
                  <div>├── .github/workflows/build-and-release.yml</div>
                  <div>├── build.gradle &amp; settings.gradle</div>
                  <div>├── app/build.gradle &amp; gradle.properties</div>
                  <div>└── README.md</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-5">
            {/* Editor preview card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Focused Editor (<code className="text-slate-300">currentInputConnection</code>)
                </span>
                <span className="text-slate-500 font-mono">
                  Length: {editorText.length} | History state: {historyIndex + 1}/{history.length}
                </span>
              </div>
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={editorText}
                  onChange={(e) => updateHistory(e.target.value)}
                  className="w-full h-36 bg-slate-950 text-slate-100 p-3 rounded-lg border border-slate-800 font-mono text-sm leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Focus here to test keyboard actions..."
                />
              </div>
              <div className="bg-slate-950/60 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 text-emerald-400 font-mono truncate">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{statusMessage}</span>
                </div>
                <div className="text-slate-500 shrink-0 ml-2">
                  Clipboard buffer: <span className="text-slate-300 font-mono">"{clipboard.slice(0, 24)}{clipboard.length > 24 ? '...' : ''}"</span>
                </div>
              </div>
            </div>

            {/* Simulated Tablet Android Landscape Keyboard */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Tablet Landscape Productivity Keyboard View
                </span>
                <span>
                  Layout: Left 25% | Center 45% | Right 30% &bull; Zero Haptic / Zero Sound
                </span>
              </div>

              {/* Native Android Frame */}
              <div className="bg-[#1E1E24] p-3 rounded-2xl border-2 border-slate-700/80 shadow-2xl">
                <div className="flex flex-row gap-3 h-64 md:h-72 w-full">
                  
                  {/* LEFT PANEL: EDITING (25%) */}
                  <div className="w-1/4 flex flex-col gap-2 p-1.5 bg-[#18181D] rounded-xl border border-slate-800">
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 text-center pb-0.5 border-b border-slate-800">
                      Editing (25%)
                    </div>
                    <div className="flex-1 flex flex-col justify-between gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-600/40 transition-colors cursor-pointer"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        COPY
                      </button>

                      <button
                        onClick={handleCut}
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-600/40 transition-colors cursor-pointer"
                        title="Cut"
                      >
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                        CUT
                      </button>

                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-600/40 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        DELETE
                      </button>

                      <button
                        onClick={handleUndo}
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-600/40 transition-colors cursor-pointer"
                        title="Undo"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-purple-400" />
                        UNDO
                      </button>

                      <button
                        onClick={handleRedo}
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-600/40 transition-colors cursor-pointer"
                        title="Redo"
                      >
                        <Redo2 className="w-3.5 h-3.5 text-purple-400" />
                        REDO
                      </button>
                    </div>
                  </div>

                  {/* CENTER PANEL: KEYBOARD SWITCHING (45%) */}
                  <div className="w-[45%] flex flex-col p-2 bg-[#18181D] rounded-xl border border-slate-800 justify-center items-center">
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 text-center pb-2">
                      IME Switcher (45%)
                    </div>
                    <button
                      onClick={handleSwitchKeyboard}
                      className="w-full h-full max-h-48 bg-gradient-to-br from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 active:from-indigo-800 active:to-indigo-950 text-white font-bold rounded-xl flex flex-col items-center justify-center gap-3 p-4 shadow-lg border border-indigo-500/30 transition-all cursor-pointer"
                      title="Switch Keyboard"
                    >
                      <Globe className="w-8 h-8 text-indigo-300 animate-pulse" />
                      <div className="text-center">
                        <div className="text-sm md:text-base tracking-wide font-extrabold">SWITCH KEYBOARD</div>
                        <div className="text-[11px] text-indigo-200/80 font-normal mt-0.5 font-mono">
                          showInputMethodPicker()
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* RIGHT PANEL: NAVIGATION (30%) */}
                  <div className="w-[30%] flex flex-col gap-2 p-1.5 bg-[#18181D] rounded-xl border border-slate-800">
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 text-center pb-0.5 border-b border-slate-800">
                      Navigation & Actions (30%)
                    </div>

                    <div className="flex-1 flex flex-col justify-between gap-1.5">
                      {/* Top Row: Select All & Paste */}
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleSelectAll}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-600/40 cursor-pointer"
                          title="Select All"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                          SELECT ALL
                        </button>
                        <button
                          onClick={handlePaste}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-600/40 cursor-pointer"
                          title="Paste"
                        >
                          <Clipboard className="w-3.5 h-3.5 text-teal-400" />
                          PASTE
                        </button>
                      </div>

                      {/* Middle Row: DPAD Navigation (Left, Up, Down, Right) */}
                      <div className="flex-1 grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleArrow('left')}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-slate-600/40 cursor-pointer"
                          title="Arrow Left"
                        >
                          <ArrowLeft className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('up')}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-slate-600/40 cursor-pointer"
                          title="Arrow Up"
                        >
                          <ArrowUp className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('down')}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-slate-600/40 cursor-pointer"
                          title="Arrow Down"
                        >
                          <ArrowDown className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('right')}
                          className="bg-slate-700/80 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-slate-600/40 cursor-pointer"
                          title="Arrow Right"
                        >
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                        </button>
                      </div>

                      {/* Bottom Row: Enter */}
                      <div className="flex-1 flex">
                        <button
                          onClick={handleEnter}
                          className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/40 shadow-sm cursor-pointer"
                          title="Enter"
                        >
                          <CornerDownLeft className="w-4 h-4" />
                          ENTER
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* File List Navigation */}
            <div className="md:col-span-1 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Project Files
              </div>
              {files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                    selectedFile === idx
                      ? 'bg-slate-800 border-emerald-500/50 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5 text-slate-200">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    {file.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {file.path}
                  </div>
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
              <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white">
                    {files[selectedFile].name}
                  </span>
                  <p className="text-[11px] font-mono text-slate-400">
                    {files[selectedFile].path}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(files[selectedFile].code, selectedFile)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedIndex === selectedFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy File</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-slate-950/90 leading-relaxed max-h-[550px]">
                <code>{files[selectedFile].code}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="max-w-3xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Integration & Setup Guide
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Steps to drop these four files into an Android Studio project and activate the keyboard.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Add Files to Android Studio</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Place each file at its target path in your Android project:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                    <li>app/src/main/AndroidManifest.xml</li>
                    <li>app/src/main/res/xml/method.xml</li>
                    <li>app/src/main/res/layout/keyboard_view.xml</li>
                    <li>app/src/main/java/com/productivity/keyboard/ProductivityKeyboardService.kt</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Build & Install APK</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Build and install the APK onto your Android tablet or emulator using Android Studio (<span className="text-slate-200 font-mono">Run 'app'</span> or <span className="text-slate-200 font-mono">./gradlew installDebug</span>).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Enable the Keyboard in System Settings</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    On your device, navigate to:
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono mt-1.5 text-[11px]">
                    Settings &gt; System &gt; Languages &amp; input &gt; On-screen keyboard &gt; Manage on-screen keyboards
                  </div>
                  <p className="text-slate-400 mt-1.5 leading-relaxed">
                    Toggle on <strong>Productivity Keyboard</strong> and acknowledge the system prompt.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Select and Use</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Tap any text field in any app, tap the keyboard switcher icon in the navigation bar (or call input method picker), and select <strong>Productivity Keyboard</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
