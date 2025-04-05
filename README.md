# react-photo-editor

![react-photo-editor](https://github.com/musama619/react-photo-editor/blob/main/react-photo-editor.png)

<p align="center">
  <a href="https://www.npmjs.com/package/react-photo-editor">
    <img src="https://img.shields.io/npm/v/react-photo-editor.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/react-photo-editor">
    <img src="https://img.shields.io/npm/dm/react-photo-editor.svg" alt="NPM Downloads" />
  </a>
  <a href="https://bundlephobia.com/package/react-photo-editor">
    <img src="https://img.shields.io/bundlephobia/minzip/react-photo-editor" alt="Bundle Size" />
  </a>
  <a href="https://github.com/musama619/react-photo-editor/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/react-photo-editor.svg" alt="License" />
  </a>
</p>

React component and hook for image editing with options to set **brightness**, **contrast**, **saturation**, and **grayscale**. Also with features to **rotate**, **flip**, **pan**, **draw** and **zoom** the photo.

## 📋 Table of Contents

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📱 Live Demo](#-live-demo)
- [⚠️ Migration Guide](#️-migration-guide)
- [🛠️ Configuration Options](#️-configuration-options)
- [🧰 Advanced Usage: Custom Component with usePhotoEditor Hook](#-advanced-usage-custom-component-with-usephotoeditor-hook)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- 🎨 **Color adjustments**: Brightness, contrast, saturation, and grayscale
- 🔄 **Image manipulation**: Rotate and flip (horizontal/vertical)
- 🔍 **Interactive control**: Pan and zoom functionality
- ✏️ **Drawing tools**: Draw directly on canvas
- 🧩 **Flexible integration**: Use as a component or with the `usePhotoEditor` hook
- 🎯 **Highly customizable**: Configurable UI, labels, and functionality

## 📦 Installation

Choose your preferred package manager:

```bash
# Using npm
npm install react-photo-editor

# Using yarn
yarn add react-photo-editor
```

## 🚀 Quick Start

```jsx
import { useState } from 'react';
import { ReactPhotoEditor } from 'react-photo-editor';

function App() {
  const [file, setFile] = useState();
  const [showModal, setShowModal] = useState(false);

  // Show modal if file is selected
  const showModalHandler = () => {
    if (file) {
      setShowModal(true);
    }
  };

  // Hide modal
  const hideModal = () => {
    setShowModal(false);
  };

  // Save edited image
  const handleSaveImage = (editedFile) => {
    setFile(editedFile);
    // Do something with the edited file
  };

  const setFileData = (e) => {
    if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <>
      <input type='file' onChange={(e) => setFileData(e)} multiple={false} />

      <button onClick={showModalHandler}>Edit Photo</button>

      <ReactPhotoEditor
        open={showModal}
        onClose={hideModal}
        file={file}
        onSaveImage={handleSaveImage}
      />
    </>
  );
}

export default App;
```

## 📱 Live Demo

See it in action on [Stackblitz](https://stackblitz.com/edit/react-flcdhq?file=src%2FApp.js,package.json)

## ⚠️ Migration Guide

### Migrating from v2.x to v3.0.0

#### Breaking Changes

- **CSS Import Removed**: The CSS file import (`import 'react-photo-editor/dist/style.css'`) is no longer required
- **Tailwind CSS Configuration**: No longer need to add `'./node_modules/react-photo-editor/dist/*.js'` to your Tailwind config
- **Changed canvas class name and id**: The ***class name*** and ***id*** for the canvas element have been changed from `canvas` to `rpe-canvas` for better consistency with the rest of the project. Make sure to update your usage accordingly.

## 🛠️ Configuration Options

The `ReactPhotoEditor` component accepts the following props:

| Prop                | Type                           | Default   | Description                                                |
| ------------------- | ------------------------------ | --------- | ---------------------------------------------------------- |
| `file`              | `File \| undefined`            | Required  | The input image file to be edited                          |
| `allowColorEditing` | `boolean`                      | `true`    | Whether to allow color editing options                     |
| `allowRotate`       | `boolean`                      | `true`    | Whether to allow rotation of the image                     |
| `allowFlip`         | `boolean`                      | `true`    | Whether to allow flipping of the image                     |
| `allowZoom`         | `boolean`                      | `true`    | Whether to allow zooming of the image                      |
| `allowDrawing`      | `boolean`                      | `true`    | Whether to enable drawing options                          |
| `downloadOnSave`    | `boolean`                      | `false`   | Whether to enable downloading the edited image upon saving |
| `open`              | `boolean`                      | `false`   | Whether the photo editor modal is open                     |
| `onClose`           | `() => void`                   | -         | Function invoked when the modal is closed                  |
| `onSaveImage`       | `(image: File) => void`        | Required  | Function invoked when the edited image is saved            |
| `modalHeight`       | `number \| string`             | `'38rem'` | Height of the photo editor modal                           |
| `modalWidth`        | `number \| string`             | `'40rem'` | Width of the photo editor modal                            |
| `canvasWidth`       | `number \| string`             | `'auto'`  | Width of the canvas element                                |
| `canvasHeight`      | `number \| string`             | `'auto'`  | Height of the canvas element                               |
| `maxCanvasHeight`   | `number \| string`             | `'22rem'` | Maximum height of the canvas element                       |
| `maxCanvasWidth`    | `number \| string`             | `'36rem'` | Maximum width of the canvas element                        |
| `labels`            | `ReactPhotoEditorTranslations` | -         | Custom labels for UI elements                              |

## 🧰 Advanced Usage: Custom Component with `usePhotoEditor` Hook

For more control over the UI and functionality, you can use the `usePhotoEditor` hook to build your own custom editor component.

For full examples, see the [example](https://github.com/musama619/react-photo-editor/blob/main/src/examples/CustomPhotoEditor.tsx) folder.

```jsx
import { usePhotoEditor } from 'react-photo-editor';

function CustomPhotoEditor({ file }) {
  const {
    canvasRef,
    brightness,
    contrast,
    saturate,
    grayscale,
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    handleZoomIn,
    handleZoomOut,
    generateEditedFile,
    resetFilters,
  } = usePhotoEditor({
    file,
    defaultBrightness: 100,
    defaultContrast: 100,
    defaultSaturate: 100,
    defaultGrayscale: 0,
  });

  const handleSave = async () => {
    const editedFile = await generateEditedFile();
    // Do something with the edited file
  };

  return (
    <div>
      <canvas ref={canvasRef} />

      <div>
        <label>Brightness: {brightness}</label>
        <input
          type='range'
          min='0'
          max='200'
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
        />
      </div>

      {/* Add more controls for other parameters */}

      <button onClick={handleZoomIn}>Zoom In</button>
      <button onClick={handleZoomOut}>Zoom Out</button>
      <button onClick={resetFilters}>Reset</button>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Hook Parameters

| Parameter               | Type                | Default   | Description                       |
| ----------------------- | ------------------- | --------- | --------------------------------- |
| `file`                  | `File \| undefined` | -         | The image file to be edited       |
| `defaultBrightness`     | `number`            | `100`     | Initial brightness level          |
| `defaultContrast`       | `number`            | `100`     | Initial contrast level            |
| `defaultSaturate`       | `number`            | `100`     | Initial saturation level          |
| `defaultGrayscale`      | `number`            | `0`       | Initial grayscale level           |
| `defaultFlipHorizontal` | `boolean`           | `false`   | Initial horizontal flip state     |
| `defaultFlipVertical`   | `boolean`           | `false`   | Initial vertical flip state       |
| `defaultZoom`           | `number`            | `1`       | Initial zoom level                |
| `defaultRotate`         | `number`            | `0`       | Initial rotation angle in degrees |
| `defaultLineColor`      | `string`            | `#000000` | Initial line color in hex code    |
| `defaultLineWidth`      | `number`            | `2`       | Initial line/stroke width         |
| `defaultMode`           | `string`            | `pan`     | Initial mode (`draw` or `move`)   |

### Return Values

The hook returns the following values and functions:

#### 🖼 Canvas & Image

| Name        | Type                           | Description                     |
| ----------- | ------------------------------ | ------------------------------- |
| `canvasRef` | `RefObject<HTMLCanvasElement>` | Reference to the canvas element |
| `imageSrc`  | `string`                       | The source of the loaded image  |

#### 🎛 State Values & Setters

| State            | Setter              | Type               | Description                         |
| ---------------- | ------------------- | ------------------ | ----------------------------------- |
| `brightness`     | `setBrightness`     | `number`           | Brightness level (default `100`)    |
| `contrast`       | `setContrast`       | `number`           | Contrast level (default `100`)      |
| `saturate`       | `setSaturate`       | `number`           | Saturation level (default `100`)    |
| `grayscale`      | `setGrayscale`      | `number`           | Grayscale level (default `0`)       |
| `rotate`         | `setRotate`         | `number`           | Rotation angle in degrees           |
| `zoom`           | `setZoom`           | `number`           | Zoom level                          |
| `flipHorizontal` | `setFlipHorizontal` | `boolean`          | Flip horizontally                   |
| `flipVertical`   | `setFlipVertical`   | `boolean`          | Flip vertically                     |
| `mode`           | `setMode`           | `'draw' \| 'move'` | Interaction mode (`draw` or `move`) |
| `lineColor`      | `setLineColor`      | `string`           | Drawing line color                  |
| `lineWidth`      | `setLineWidth`      | `number`           | Drawing line width                  |

#### 🛠 Utility Functions

| Function             | Type                  | Description                                |
| -------------------- | --------------------- | ------------------------------------------ |
| `handleZoomIn`       | `() => void`          | Zoom in                                    |
| `handleZoomOut`      | `() => void`          | Zoom out                                   |
| `resetFilters`       | `() => void`          | Reset all filters and transformations      |
| `downloadImage`      | `() => void`          | Download current canvas as an image        |
| `generateEditedFile` | `() => Promise<File>` | Returns the edited canvas as a File object |

#### 🖱 Event Handlers

| Function            | Type                  | Description      |
| ------------------- | --------------------- | ---------------- |
| `handlePointerDown` | `PointerEventHandler` | Used for drawing |
| `handlePointerUp`   | `PointerEventHandler` | Used for drawing |
| `handlePointerMove` | `PointerEventHandler` | Used for drawing |
| `handleWheel`       | `WheelEventHandler`   | Used for zooming |

## 🤝 Contributing

Contributions to `react-photo-editor` are welcome! If you have any issues, feature requests, or improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/musama619/react-photo-editor).

### How to Contribute

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Reporting Issues

When reporting issues, please provide:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (browser, OS, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/musama619/react-photo-editor/blob/main/LICENSE) file for details.
