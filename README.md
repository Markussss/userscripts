# Userscripts and Userstyles

I enjoy creating userscripts in order to improve my user experience when using websites. My main browser is Firefox, and I use [FireMonkey](https://addons.mozilla.org/en-CA/firefox/addon/firemonkey/) as a userscript and userstyle manager. Most other browsers and userscript managers should work, as well, but these are the ones I use.

## Userscripts

### Nordea Investor Improvements

[Source](nordea-investor.user.js) | [Install](../raw/master/nordea-investor.user.js)

Currently requires some special setup of the main page to be useful:

- Every instrument in My Instruments has to be added to favorites in order to be able to get the latest price for each instrument
- Ignored instruments are only added in the source file
- The left/west column should only contain My Instruments, in order to make it span across both columns. Everything else goes in the right/east column.

**Upcoming tasks and improvements**

- Create convenience functions for working with tables
  - addColumn(header, position, rowFunction = (row) => { return cellContents })
- Replace the latest price with a copy of the add to favorite button in instruments table
- Make it possible to ignore and unignore instruments per user
- New columns in My instruments:
  - Amount of each instrument
    - Calculated by dividing current row value by latest price
  - Total gave per row
    - Calculated by multiplying Amount by Average Gave
  - Gains/losses
    - Total Value - (Average Gave x Amount)

## Userstyles

### Flip video

[Source](flip-video.user.css) | [Install](../raw/master/flip-video.user.css)

Turn on to flip any video on the page. Quite useful when you find that a video has been flipped, and you want to watch the original.

### Resize video

[Source](resize-video.user.css) | [Install](../raw/master/resize-video.user.css)

Resizes videos that originally had a 4:3 aspect ratio and were stretched out to a 16:9 aspect ratio back to the original 4:3 aspect ratio. Not very common, but very useful when you want to watch that old video clip.
