VS Code Shell Integration — Manual Install

Overview

This document explains how to add VS Code shell integration into your shell init file so the integrated terminal loads the shell helper script on startup. Use the section matching your shell.

Notes
- When using manual install it's recommended to set `terminal.integrated.shellIntegration.enabled` to `false` in workspace settings (optional).
- If you run the Insiders build, use `code-insiders` instead of `code`.

PowerShell (Windows)

1. Open your PowerShell profile in VS Code:

```powershell
code $Profile
```

2. Add this snippet to the profile (append):

```powershell
if ($env:TERM_PROGRAM -eq "vscode") {
  . "$(code --locate-shell-integration-path pwsh)"
}
```

3. Save the file and restart your integrated terminal.

If you prefer to inline the script to avoid the small Node startup delay:

```powershell
# Get the path first
code --locate-shell-integration-path pwsh
# Copy the resulting script's content and paste it directly into your $Profile
```

Bash / Git Bash

Open `~/.bashrc` (or run `code ~/.bashrc`), then add:

```sh
[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"
```

Zsh

Open `~/.zshrc` (or run `code ~/.zshrc`), then add:

```sh
[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"
```

Fish

Open your Fish config (run `code $__fish_config_dir/config.fish`) then add:

```fish
string match -q "$TERM_PROGRAM" "vscode"; and . (code --locate-shell-integration-path fish)
```

Notes on Portability vs Performance

- The recommended approach uses `code --locate-shell-integration-path` at runtime and is cross-platform, but it starts Node.js which adds a small delay to shell startup.
- To remove the delay, resolve the script path once and inline the script content into your profile (see PowerShell inline example).

Recommended Workspace Setting (optional)

If you want the VS Code terminal to use the manual integration rather than the built-in automatic behavior, set this in the workspace settings (`.vscode/settings.json`):

```json
{
  "terminal.integrated.shellIntegration.enabled": false
}
```

Troubleshooting

- If `code --locate-shell-integration-path <shell>` returns nothing, ensure `code` is on your PATH (run `code --version` to verify).
- For Insiders build use `code-insiders` in place of `code`.
- If the snippet doesn't appear to load, open a new integrated terminal session (not just a new tab).

Security & Privacy

- The integration script is a small helper that improves terminal experience. Review its contents before inlining into your profile if you have concerns.

Files changed/created by this guidance

- [docs/SHELL_INTEGRATION.md](docs/SHELL_INTEGRATION.md) — this file
- Optional: add the workspace setting file `.vscode/settings.json` to set `terminal.integrated.shellIntegration.enabled` to `false` (created in repo as a recommendation).