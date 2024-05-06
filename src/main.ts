import "./styles/app.pcss";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;

if (typeof window !== "undefined") {
  import("./pwa");
}
