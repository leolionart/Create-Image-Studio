---
description: Generate and replace before/after images for a new demo case
---

Follow these steps strictly to generate a new demo case with "before" and "after" images. Do NOT deviate from this flow.

1. **Information Gathering**:
   - Get the idea and sample prompt from the user.
   - Determine the category and author (default to "@Leo" if not specified).

2. **Generate "Before" Image**:
   - Use `generate_image` to create a realistic "before" image based on the idea.
   - Save the image to `/tmp/before.png`.

3. **Generate "After" Image**:
   - Use `generate_image` with the `/tmp/before.png` as a reference image.
   - Apply the sample prompt to transform/modify the "before" image.
   - Save the image to `/tmp/after.png`.

4. **Integration**:
   - Determine the next available ID in `src/constants.ts` (if creating new) or the existing ID (if updating).
   - Rename `/tmp/before.png` to `public/input-images/case{ID}-input1.png`.
   - Rename `/tmp/after.png` to `public/card-previews/{kebab-case-title}.png`.
   - Update `src/constants.ts` with the new/updated entry.

5. **Deployment & Sync**:
   // turbo
   - Run `git add .` to stage the changes.
   // turbo
   - Run `git commit -m "feat: add new demo case {ID} - {title}"` to commit.
   // turbo
   - Run `git push` to synchronize changes to the repository.

6. **Notification**:
   - Inform the user that the new demo case has been added and synced.
