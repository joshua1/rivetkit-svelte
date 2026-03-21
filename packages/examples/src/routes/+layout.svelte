<script lang="ts">
  let { children } = $props();
</script>

<nav>
  <a href="/">Counter</a>
  <a href="/ssr">SSR Counter</a>
  <a href="/todos">Todos</a>
</nav>

<main>
  {@render children?.()}
</main>

<style>
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  nav a {
    text-decoration: none;
    font-weight: 500;
    color: #333;
  }
  nav a:hover {
    color: #000;
    text-decoration: underline;
  }
  main {
    padding: 1rem;
  }
</style>
