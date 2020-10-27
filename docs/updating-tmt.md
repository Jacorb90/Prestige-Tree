# Updating The Modding Tree

This tutorial assumes that you have used [the Getting Started Tutorial](getting-started.md), and are using Github Desktop and VSCode for your mod.

Here's what you have to do when there's a TMT update:

1. Look at the changelog. It will warn you if the update will break anything or require any changes. Decide if you want to try to update.

2. Open Github Desktop, and at the top middle, click "fetch origin". This will make Github Desktop get information about the update. 

3. Click where it says "current branch: master" at the top middle, and at the bottom of the thing that appears, click "choose a branch to merge into master".

4. Select upstream/master. It will likely say there are conflicts, but you have tools to resolve them. Click "Merge upstream/master into master".

5. A conflict happens when the things you're trying to merge have both made changes in the same place. Click "open in Visual Studio Code" next to the first file. 

6. Scroll down through the file, and look for the parts highlighted in red and green. One of these is your code, and the other is some code that will be modified by the update. Do your best to try to edit things to keep the updated changes, but keep your content.

7. Continue to do this for all remaining changes.

8. Do any other changes required by the update, run the game, fix issues, etc.
