import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReactPhotoEditor } from "../components/ReactPhotoEditor";
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers);
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();


describe("ReactPhotoEditor Component", () => {

    const fileData = new File(["test content"], "test.png", { type: "image/png" });
    const onSaveImage = vi.fn();

    it("should render component correctly", () => {
        render(<ReactPhotoEditor file={fileData} onSaveImage={onSaveImage} open={true} />);

        const canvas = screen.getByTestId("image-editor-canvas");
        expect(canvas).toBeInTheDocument();
    });
    it("should render rotate div correctly", () => {
        render(<ReactPhotoEditor file={fileData} onSaveImage={onSaveImage} open={true} allowRotate={true} />);

        const rotate = screen.getByText("Rotate:");
        expect(rotate).toBeInTheDocument();
    });
    it("should render flip buttons", () => {
        render(
            <ReactPhotoEditor
                file={fileData}
                onSaveImage={onSaveImage}
                open={true}
                allowFlip={true}
            />
        );

        const flipButtons = screen.getByTestId("flip-btns");
        expect(flipButtons).toBeInTheDocument();
    });
    it("should render zoom buttons", () => {
        render(
            <ReactPhotoEditor
                file={fileData}
                onSaveImage={onSaveImage}
                open={true}
                allowZoom={true}
            />
        );

        const zoomButtons = screen.getByTestId("zoom-btns");
        expect(zoomButtons).toBeInTheDocument();
    });
    it("should not render component if open == false", () => {
        render(
            <ReactPhotoEditor
                file={fileData}
                onSaveImage={onSaveImage}
                open={false}
            />
        );

        const zoomButtons = screen.queryByTestId("photo-editor-main");
        expect(zoomButtons).not.toBeInTheDocument();
    });
});