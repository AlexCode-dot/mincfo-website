# Landing Page Scroll Snap

## Plain HTML, CSS, JS

Use CSS scroll snap as the base, then add a small controller that only steps one section at a time for desktop wheel and keyboard input.

```html
<main class="snap-page" id="snap-page">
  <section class="snap-section" id="hero">Hero</section>
  <section class="snap-section" id="product">Product</section>
  <section class="snap-section" id="customers">Customers</section>
</main>

<nav class="snap-dots" aria-label="Section progress">
  <button type="button" data-target="hero" aria-current="true">Hero</button>
  <button type="button" data-target="product">Product</button>
  <button type="button" data-target="customers">Customers</button>
</nav>

<script>
  const sections = Array.from(document.querySelectorAll(".snap-section"));
  const dots = Array.from(document.querySelectorAll(".snap-dots [data-target]"));
  const threshold = 72;
  const resetMs = 180;
  const transitionMs = 720;
  let activeIndex = 0;
  let wheelDelta = 0;
  let lastWheelAt = 0;
  let transitionActive = false;
  let releaseTimer = null;

  const setActive = (index) => {
    activeIndex = Math.max(0, Math.min(index, sections.length - 1));
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const releaseTransition = () => {
    transitionActive = false;
    if (releaseTimer) {
      window.clearTimeout(releaseTimer);
      releaseTimer = null;
    }
  };

  const goToIndex = (index) => {
    const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
    const target = sections[nextIndex];
    if (!target) return;

    transitionActive = true;
    setActive(nextIndex);
    releaseTimer = window.setTimeout(releaseTransition, transitionMs);
    window.scrollTo({
      top: target.offsetTop,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  window.addEventListener("scroll", () => {
    const probe = window.scrollY + window.innerHeight * 0.5;
    let nextIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;
    sections.forEach((section, index) => {
      const distance = Math.abs(section.offsetTop - probe);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nextIndex = index;
      }
    });
    setActive(nextIndex);
  }, { passive: true });

  window.addEventListener("wheel", (event) => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer || event.ctrlKey) return;

    const deltaY = event.deltaY;
    if (Math.abs(deltaY) < 4) return;

    if (transitionActive) {
      event.preventDefault();
      return;
    }

    const now = performance.now();
    if (now - lastWheelAt > resetMs) {
      wheelDelta = 0;
    }

    lastWheelAt = now;
    wheelDelta += deltaY;
    if (Math.abs(wheelDelta) < threshold) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const direction = wheelDelta > 0 ? 1 : -1;
    wheelDelta = 0;
    goToIndex(activeIndex + direction);
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (transitionActive) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      goToIndex(activeIndex + 1);
    }
    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goToIndex(activeIndex - 1);
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToIndex(index));
  });
</script>
```

```css
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #060b12;
  color: #f5f7fb;
}

.snap-section {
  min-height: 100svh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.snap-dots {
  position: fixed;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

## Next.js + SCSS Adaptation

This repo uses the same pattern in the following places:

- Controller and progress dots: [src/components/home/HomeSnapShell.tsx](/Users/alexanderandersson/Developer/mincfo-website/mincfo-landing/src/components/home/HomeSnapShell.tsx)
- Dot styles: [src/components/home/HomeSnapShell.module.scss](/Users/alexanderandersson/Developer/mincfo-website/mincfo-landing/src/components/home/HomeSnapShell.module.scss)
- Global snap rules: [src/styles/globals.scss](/Users/alexanderandersson/Developer/mincfo-website/mincfo-landing/src/styles/globals.scss)
- Home page integration: [src/app/page.tsx](/Users/alexanderandersson/Developer/mincfo-website/mincfo-landing/src/app/page.tsx)

The Next.js version keeps document scrolling intact instead of moving everything into a custom overflow container. That is important here because the landing page already has several sections listening to `window.scroll`, and forcing a nested scroll container would break those interactions.

## Recommended Timings

- Wheel intent threshold: `64px` to `84px`
- Wheel reset window: `160ms` to `220ms`
- Transition guard: `600ms` to `800ms`
- Reduced-motion guard: `0ms` to `150ms`

The implementation uses `72px`, `180ms`, and `720ms`, which is fast enough to feel guided without creating the "stuck page" effect.

## UX Tradeoffs

This approach is better than a long scroll lock because it solves the main landing-page problem, accidental multi-section skips, without taking control away from the user for multiple seconds.

- CSS scroll snap keeps touch and normal scrolling behavior native.
- The JavaScript layer only filters desktop wheel bursts and keyboard steps.
- The short transition guard prevents stutter and double-jumps but expires quickly.
- Reduced motion falls back to direct snaps instead of forcing smooth animation.

## Edge Cases To Test

- Mouse wheel with large detents on Windows mice
- Small, repeated trackpad deltas on macOS
- Rapid repeated wheel input during an active section transition
- Keyboard stepping with `ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`, `Home`, and `End`
- Deep links like `/#customers`
- Resizing the viewport mid-transition
- Switching content modes if a section is conditionally rendered
- Very tall section content that exceeds `100svh`

## Nested Scrollable Content

If a section needs its own scrollable panel, keep the outer section snapped and make the inner panel explicit:

```scss
.panelScroller {
  max-height: min(70svh, 720px);
  overflow: auto;
  overscroll-behavior: contain;
}
```

```html
<div class="panelScroller" data-snap-scrollable="true"></div>
```

The controller in this repo checks scrollable ancestors first. If the inner panel can still scroll in the current direction, it leaves the wheel event alone. Once the inner panel reaches its edge, section navigation can take over again.
