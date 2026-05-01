Output examples/demo-project/demo.gif

Set Shell "zsh"
Set FontSize 18
Set Width 1280
Set Height 720
Set Theme "Catppuccin Mocha"
Set TypingSpeed 50ms

Type "cd /Users/izoy/Documents/archspine"
Enter
Type "npm run build"
Enter
Sleep 3s

Type "cd examples/demo-project"
Enter
Type "rm -rf .spine/index .spine/atlas"
Enter
Sleep 1s

Type "rm -f .spine/cache.db .spine/manifest.json .spine/languages.json .spine/.lock"
Enter
Sleep 1s

Type "SPINE_PROVIDER=mock node ../../dist/cli/index.js sync"
Enter
Sleep 3s

Type "SPINE_PROVIDER=mock node ../../dist/cli/index.js check"
Enter
Sleep 3s

Type "SPINE_PROVIDER=mock node ../../dist/cli/index.js fix"
Enter
Sleep 2s

Type "y"
Enter
Sleep 3s
