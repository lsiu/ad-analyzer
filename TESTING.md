# Testing the Ad Highlighter Extension

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `/src` directory
4. The extension should now be loaded and active

## Testing the Extension

1. Navigate to any website that displays ads (news sites often work well)
2. Ads should automatically be highlighted with a red dashed border after a few seconds
3. The highlighting includes a subtle pulsing animation to make ads more noticeable
4. The extension now uses more specific selectors to reduce false positives

## Testing the Popup

1. Click the Ad Highlighter extension icon in the Chrome toolbar
2. The popup should appear with a "Refresh Ad Detection" button
3. Click the button to manually trigger ad detection

## Troubleshooting

If ads aren't being highlighted:

1. Some websites use techniques to prevent extensions from accessing their content
2. Try clicking the "Refresh Ad Detection" button in the popup
3. Check the browser console for any error messages (Ctrl+Shift+J or Cmd+Option+J)
4. The extension may not detect all ads, especially those loaded in iframes from different domains

## Reduced False Positives

The extension has been updated to significantly reduce false positives:
- More specific CSS selectors target actual ads
- Size-based filtering skips elements that are too small or too large
- Blacklist filtering skips common UI elements
- Content-based filtering checks for ad-like characteristics
- Elements with large amounts of text are less likely to be highlighted

## Messaging Error Handling

The extension now properly handles messaging errors that could occur when:
- The popup is closed before a response is received
- The content script is not available
- Communication between popup and content script fails

These errors are now caught and handled gracefully without showing console errors.

## Customizing Ad Detection

The extension uses a combination of CSS selectors to identify ads. You can modify these selectors in `content.js`:

- Add new selectors to the `adSelectors` array
- Adjust the size thresholds in the `highlightAds()` function
- Modify the highlighting style in `styles.css`
- Update the blacklist in `blacklistSelectors` to skip additional elements

Note that some websites may have Content Security Policies that prevent the extension from working properly.