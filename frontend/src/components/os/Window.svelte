<script lang="ts">
  let { title = 'Untitled', active = false, children }: {
    title?: string;
    active?: boolean;
    children: any;
  } = $props();
</script>

<div class="window" class:active>
  <!-- Title bar -->
  <div class="titlebar">
    <div class="traffic-lights">
      <button class="close" aria-label="Close"></button>
      <button class="minimize" aria-label="Minimize"></button>
      <button class="maximize" aria-label="Maximize"></button>
    </div>
    <span class="title">{title}</span>
  </div>

  <!-- Content -->
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .window {
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #0a0a0c;
    border: 1px solid #1a1a1e;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .window.active {
    box-shadow: 0 0 0 1px rgba(0, 217, 146, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .titlebar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    height: 2.25rem;
    border-bottom: 1px solid #1a1a1e;
    background: rgba(17, 17, 19, 0.5);
  }

  .traffic-lights {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .traffic-lights button {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: opacity 150ms;
  }

  .close { background: #ff5f57; }
  .close:hover { opacity: 0.8; }
  .minimize { background: #febc2e; }
  .minimize:hover { opacity: 0.8; }
  .maximize { background: #28c840; }
  .maximize:hover { opacity: 0.8; }

  .title {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    color: #8a8a8e;
    font-weight: 500;
    padding: 0 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content {
    padding: 1.5rem;
  }
</style>
