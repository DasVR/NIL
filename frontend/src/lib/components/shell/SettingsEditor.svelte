<script lang="ts">
</script>

<div class="settings-pane">
  <h3>Editor</h3>
  <p class="settings-description">Code editor behavior and display</p>

  <div class="settings-group">
    <h4>Display</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Font Size</span>
        <span class="setting-desc">Editor font size in pixels</span>
      </div>
      <div class="setting-control">
        <input type="number" min="10" max="24" step="1" value="13" />
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Font Family</span>
        <span class="setting-desc">Editor font</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="'JetBrains Mono', monospace" selected>JetBrains Mono</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="'Cascadia Code', monospace">Cascadia Code</option>
          <option value="'Monaspace Neon', monospace">Monaspace Neon</option>
          <option value="'Iosevka', monospace">Iosevka</option>
        </select>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Line Height</span>
        <span class="setting-desc">Line spacing multiplier</span>
      </div>
      <div class="setting-control">
        <input type="number" min="1.0" max="2.0" step="0.1" value="1.5" />
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Ligatures</span>
        <span class="setting-desc">Enable font ligatures</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>Behavior</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Tab Size</span>
        <span class="setting-desc">Spaces per tab</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="2">2</option>
          <option value="4" selected>4</option>
          <option value="8">8</option>
        </select>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Insert Spaces</span>
        <span class="setting-desc">Use spaces instead of tabs</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Word Wrap</span>
        <span class="setting-desc">Wrap long lines</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="off">Off</option>
          <option value="on" selected>On</option>
          <option value="wordWrapColumn">At column</option>
          <option value="bounded">Bounded</option>
        </select>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Minimap</span>
        <span class="setting-desc">Show code minimap</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Line Numbers</span>
        <span class="setting-desc">Show line numbers</span>
      </div>
      <div class="setting-control">
        <select>
          <option value="on" selected>On</option>
          <option value="off">Off</option>
          <option value="relative">Relative</option>
          <option value="interval">Interval</option>
        </select>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h4>IntelliSense</h4>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Quick Suggestions</span>
        <span class="setting-desc">Show suggestions while typing</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Suggest on Trigger</span>
        <span class="setting-desc">Show suggestions on trigger characters</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Parameter Hints</span>
        <span class="setting-desc">Show function parameter hints</span>
      </div>
      <div class="setting-control">
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>
</div>