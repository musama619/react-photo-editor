
export interface ReactPhotoEditorProps {
    /**
     * The input image file to be edited.
     */
    file: File | undefined,
  
    /**
     * Whether to allow color editing options.
     * @default true
     */
    allowColorEditing?: boolean,
  
    /**
     * Whether to allow rotation of the image.
     * @default true
     */
    allowRotate?: boolean,
  
    /**
     * Whether to allow flipping (horizontal/vertical) of the image.
     * @default true
     */
    allowFlip?: boolean,
  
    /**
     * Whether to allow zooming of the image.
     * @default true
     */
    allowZoom?: boolean,
  
    /**
     * Whether to enable the option to download the edited image upon saving.
     * @default false
     */
    downloadOnSave?: boolean,
  
    /**
     * Whether the photo editor modal is open.
     * @default false
     */
    open?: boolean,
  
    /**
     * Function invoked when the photo editor modal is closed.
     */
    onClose?: () => void,
  
    /**
     * Function invoked when the edited image is saved.
     * @param image - The edited image file.
     */
    onSaveImage: (image: File) => void,
  }
  