
export interface ReactPhotoEditorProps {
    file: File | undefined
    allowColorEditing?: boolean
    allowRotate?: boolean
    allowFlip?: boolean
    allowZoom?: boolean
    downloadOnSave?: boolean
    open?: boolean
    onClose?: () => void
    onSaveImage: (image: File) => void
}