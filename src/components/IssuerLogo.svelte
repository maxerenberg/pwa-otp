<script lang="ts">
  // NOTE: if any of these exceed 4 KiB, make sure to update the globPatterns
  // in vite.config.ts
  import googleLogo from "../assets/google.svg";
  import microsoftLogo from "../assets/microsoft.svg";
  import facebookLogo from "../assets/facebook.svg";
  import discordLogo from "../assets/discord.svg";
  import githubLogo from "../assets/github.svg";
  import githubDarkThemeLogo from "../assets/github-dark-theme.svg";
  import UserCircleSolid from "./icons/UserCircleSolid.svelte";

  export let issuer: string; // e.g. "Google"
  export let name: string; // e.g. "jdoe@gmail.com"
  let className: string;
  export { className as class };

  const issuerRegex = /google|gmail|microsoft|outlook|facebook|github|discord/i;
  const nameRegex = /(gmail|outlook|hotmail|live)\.com/;
  const issuerToLogo: Partial<Record<string, string>> = {
    google: googleLogo,
    gmail: googleLogo,
    microsoft: microsoftLogo,
    outlook: microsoftLogo,
    facebook: facebookLogo,
    github: githubLogo,
    discord: discordLogo,
  };
  const nameToLogo: Partial<Record<string, string>> = {
    gmail: googleLogo,
    outlook: microsoftLogo,
    hotmail: microsoftLogo,
    live: microsoftLogo,
  };
  const darkThemeLogos: Partial<Record<string, string>> = {
    [githubLogo]: githubDarkThemeLogo,
  };
  function getLogo(issuer: string, name: string): string | undefined {
    let logo: string | undefined = undefined;
    let matches = issuerRegex.exec(issuer);
    if (matches) {
      logo = issuerToLogo[matches[0].toLowerCase()];
    } else {
      matches = nameRegex.exec(name);
      if (matches) {
        logo = nameToLogo[matches[1]];
      }
    }
    return logo;
  }
  $: logo = getLogo(issuer, name);
  $: darkThemeLogo = logo ? darkThemeLogos[logo] : undefined;
</script>

{#if logo}
  {#if darkThemeLogo}
    <picture class={className}>
      <source srcset={darkThemeLogo} media="(prefers-color-scheme: dark)" />
      <img src={logo} alt={`${issuer} logo`} />
    </picture>
  {:else}
    <img src={logo} alt={`${issuer} logo`} class={className} />
  {/if}
{:else}
  <UserCircleSolid class={className} />
{/if}
