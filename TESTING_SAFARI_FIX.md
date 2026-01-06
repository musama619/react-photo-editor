# Testing Safari Canvas Filter Fix

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app in Safari:**
   - The dev server will show a URL (usually `http://localhost:5173`)
   - Open this URL in **Safari browser** (not Chrome/Firefox)

## Testing Steps

### 1. Basic Filter Testing

1. **Upload an image:**
   - Click "Choose File" and select a test image
   - Click "Edit" button to open the editor

2. **Test Brightness:**
   - Adjust the brightness slider (try values like 50, 150, 200)
   - **Expected:** Canvas should show brightness changes immediately
   - **Save the image** and verify the saved file has the brightness applied

3. **Test Contrast:**
   - Reset filters if needed
   - Adjust contrast slider (try values like 50, 150, 200)
   - **Expected:** Canvas should show contrast changes
   - **Save the image** and verify the saved file has the contrast applied

4. **Test Saturation:**
   - Adjust saturation slider (try 0 for grayscale, 200 for oversaturated)
   - **Expected:** Canvas should show saturation changes
   - **Save the image** and verify the saved file has the saturation applied

5. **Test Grayscale:**
   - Adjust grayscale slider (try 100 for full grayscale)
   - **Expected:** Canvas should show grayscale effect
   - **Save the image** and verify the saved file is grayscale

### 2. Combined Filters Testing

1. Apply multiple filters simultaneously:
   - Brightness: 120
   - Contrast: 130
   - Saturation: 80
   - Grayscale: 0
   - **Expected:** All filters should work together
   - **Save and verify** the combined effect is in the saved image

### 3. Verify Safari Detection

1. **Open Safari Developer Tools:**
   - Press `Cmd + Option + I` (Mac) or enable Developer menu in Safari preferences
   - Go to Console tab

2. **Check for console log:**
   - When you adjust filters, you should see: `[Safari detected] Using manual filter fallback`
   - This confirms Safari was detected and fallback is being used

### 4. Compare with Chrome (Optional)

1. **Test in Chrome:**
   - Open the same URL in Chrome
   - Apply the same filters
   - **Expected:** Filters should work (native `context.filter` support)
   - **Note:** You should NOT see the Safari console log in Chrome

2. **Compare saved images:**
   - Save the same image with same filters in both browsers
   - Compare the files - they should look identical

## Testing Without Safari (Alternative Methods)

### Option 1: User-Agent Spoofing in Chrome DevTools

1. Open Chrome DevTools (`F12`)
2. Click the three dots menu → More tools → Network conditions
3. Check "User agent" and select "Safari" or enter custom:
   ```
   Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15
   ```
4. Refresh the page
5. **Note:** This only spoofs the user agent - Chrome's canvas filter support will still work, but you can test if the detection logic triggers

### Option 2: Use BrowserStack or Similar Service

1. Sign up for BrowserStack (free trial available)
2. Test on real Safari browsers (Mac/iOS)
3. This gives you the most accurate testing environment

### Option 3: Virtual Machine with macOS

1. If you have access to a Mac or macOS VM
2. Install Safari and test directly

## What to Look For

### ✅ Success Indicators:
- Filters apply immediately on the canvas in Safari
- Saved images (via `generateEditedFile()` or download) include all filter effects
- Console shows Safari detection message
- No visual artifacts or performance issues

### ❌ Failure Indicators:
- Canvas shows no filter changes (only CSS preview works)
- Saved images don't have filters applied
- Console errors related to canvas operations
- Performance degradation or freezing

## Debugging Tips

1. **Check Console:**
   - Look for the `[Safari detected]` message
   - Check for any JavaScript errors

2. **Inspect Canvas:**
   - Right-click canvas → Inspect Element
   - Check if canvas dimensions are correct
   - Verify image is being drawn

3. **Test Individual Filters:**
   - Test each filter in isolation to identify which might be failing
   - Check if the manual filter calculations are correct

4. **Compare Pixel Values:**
   - Use canvas `getImageData()` to inspect pixel values
   - Compare with expected values after filter application

## Expected Behavior

- **Before Fix:** Filters work in CSS preview but NOT in saved canvas images
- **After Fix:** Filters work in both CSS preview AND saved canvas images in Safari

