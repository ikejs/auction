/*!
 * Auction embed loader.
 *
 * Usage on any website:
 *   <div class="rp-auction" data-slug="your-auction-slug" data-theme="dark"></div>
 *   <script src="https://your-auction-site/embed.js" defer></script>
 *
 * - Omit data-slug (or leave it empty) to show the current live auction.
 * - data-theme is "light" (default) or "dark".
 * - Multiple widgets per page are supported.
 */
(function () {
  // Origin this script was served from — the auction site.
  var ORIGIN = (function () {
    if (document.currentScript && document.currentScript.src) {
      return new URL(document.currentScript.src).origin;
    }
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf("/embed.js") > -1) {
        return new URL(scripts[i].src).origin;
      }
    }
    return window.location.origin;
  })();

  var embeds = []; // { iframe, height }

  function mount(el) {
    if (el.__rpAuctionMounted) return;
    el.__rpAuctionMounted = true;

    var slug = (el.getAttribute("data-slug") || "").trim();
    var theme = (el.getAttribute("data-theme") || "").trim().toLowerCase();
    var src = ORIGIN + "/embed" + (slug ? "/" + encodeURIComponent(slug) : "");
    if (theme === "light" || theme === "dark") src += "?theme=" + theme;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Auction";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allow", "autoplay");
    iframe.style.cssText =
      "width:100%;border:0;display:block;height:600px;background:transparent;";
    el.appendChild(iframe);
    embeds.push({ iframe: iframe, height: 600 });
  }

  function init() {
    var els = document.querySelectorAll(".rp-auction");
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== ORIGIN) return;
    var rec = null;
    for (var i = 0; i < embeds.length; i++) {
      if (embeds[i].iframe.contentWindow === e.source) {
        rec = embeds[i];
        break;
      }
    }
    if (!rec) return;
    var data = e.data || {};

    if (data.type === "rp-auction-height" && typeof data.height === "number") {
      rec.height = data.height;
      // Don't resize while the modal overlay is active.
      if (rec.iframe.style.position !== "fixed") {
        rec.iframe.style.height = data.height + "px";
      }
    } else if (data.type === "rp-auction-modal") {
      if (data.open) {
        // Expand the iframe to cover the viewport so the centered modal works.
        rec.iframe.style.cssText =
          "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:transparent;";
      } else {
        rec.iframe.style.cssText =
          "width:100%;border:0;display:block;height:" +
          rec.height +
          "px;background:transparent;";
      }
    }
  });

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
