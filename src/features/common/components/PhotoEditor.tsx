import { ImageEditorComponent } from "@syncfusion/ej2-react-image-editor";
import { useRef } from "react";

const toolbarItems = [
  "Crop", "Straightening", "Annotate", "Transform", "Finetune", 
  "Filter", "Frame", "Resize", "ZoomIn", "ZoomOut", 
  "Undo", "Redo", "Reset", "Redact", "Resize",
  { id: "custom-save", text: "Save", prefixIcon: "e-icons e-save" },
  { id: "custom-cancel", text: "Cancel", prefixIcon: "e-icons e-close" },
];

type Props = {
    handleSave: (file: File | null) => void;
    closeModal: () => void;
    filePreview: string;
}

const ImageEditor: React.FC<Props> = ({ filePreview, closeModal, handleSave }) => {
  const imgEditorRef = useRef<ImageEditorComponent>(null);

  const onCreated = () => {
    imgEditorRef.current?.open(filePreview);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onToolbarClick = (args: any) => {
    if (args.item.id === "custom-save") {
      const imageData = imgEditorRef.current?.getImageData(true);
      
      if (imageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          ctx.putImageData(imageData, 0, 0);          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "edited-image.png", { 
                type: blob.type 
              });
              handleSave(file);
              closeModal();
            }
            canvas.width = 0;
            canvas.height = 0;
          }, 'image/png', 1);
        }
      }
    } else if (args.item.id === "custom-cancel") {
      closeModal();
    }
  };

  return (
    <div className="absolute z-40 left-0 top-0 w-full h-full">
      <ImageEditorComponent
        ref={imgEditorRef}
        created={onCreated}
        toolbarItemClicked={onToolbarClick}
        toolbar={toolbarItems}
      />
    </div>
  );
};

export default ImageEditor;