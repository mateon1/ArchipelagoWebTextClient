# ArchipelagoMobileTextClient

This Client is to be used along side [Archipelago](https://archipelago.gg) to view the text chat of what items have been sent/received. Along with the text chat, you will also be able to easily view your received items, as well as the current hints that you have.

# Archipelago Setup

The setup guides for Archipelago can be found [Here](https://archipelago.gg/tutorial/)

# Connecting to Archipelago

Once you receive the room page from the host, you can enter the following to connect:

* **Slot Name**: your name in the multiworld. This is the name you entered in the YAML.
* **Server Url:Port**: (default: archipelago.gg:38281).
* **Password**: optional password, leave blank if no password was set.


# Remote Commands

You are able to use all remote commands that Archipelago has.

For example: `!help` to show all available remote commands.

The commands can be found [Here](https://archipelago.gg/tutorial/Archipelago/commands/en#remote-commands)

# Development

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
