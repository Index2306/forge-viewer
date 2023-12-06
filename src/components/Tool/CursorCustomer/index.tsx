import React, {useContext, useEffect} from 'react';
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

const forgeCursor =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAABHVBMVEUAAABPTk4AAAAAAAAJCQkRERE0MzQQEBAODg4QEBB4d3dbWlo9PDw/Pj4vLy8sLCwZGBgWFhYcHBwKCgoSEhIAAAAKCgoICAgKCgoQEBAODg4EBAQICAgPDw8REREMDAx2dnY0NDQvLy9QUFAaGhomJSYjIyM7OjokJCQNDA0mJiYNDQ0AAAAUFBQJCQkQEBAEBAQNDQ0PDw8VFRX///+amJkAAAD5+fnz8/PKycn9/f339vbi4eLR0dDNzMyAgIB8e3xycHH7+/vw7+/o6OjX1ta7urq4t7iwsLCnp6eioqKbmppva21OTk74+Pjl5eXc3Nzb29vLy8vDw8PDwsKrqqqdnZ2WlpaSkpKTkZKMiouEg4NkZGRISEgxLzBpgbsEAAAANHRSTlMA+fiQXgngKSYG/vX17uvBuqackpCNg3BpUkpAPBwTDvj18+vl0s/NwrOwoZZ+TDg4NBkBGrzX8QAAAP5JREFUKM99j9Vuw0AQRdeuKZyGkyZNmbnXDLHDVGb8/8/oy7paK1bO0+oc7WiGnGiaxq+QRTQAOh8f9Jv4H/Ge8PZPrCdlvkxfYluUT2WyyCq3mZ7unwlKVLcqOzA/Mf71j0TWJ/Ym6rPeca05Ni4iIevYc7yoUD2zQFhq71BdI9nvBeBabFDSPe8DswlUc1Riw3VxbH0NHBUPQ0jrbDnPYDjALQBMq9E7nkC5y7VDKTZlUg8Q0lmjvl74zlYErgvKa42GPKf3/a0kQmYCDY1SYMDosqMoiWrGwz/uAbNvc/fNon4kXRKGq+PUo2Mb96afV0iUxqGU2s4VBbKUP65NL/LKF+7ZAAAAAElFTkSuQmCC';

const CursorCustomer = () => {
    const {cursorCustomer} = useContext(ForgeViewerContext)

    useEffect(() => {
        if (window?.NOP_VIEWER?.canvas?.style) {
            window.NOP_VIEWER.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, onScrollEnd);
            if (cursorCustomer) {
                window.NOP_VIEWER.canvas.style.cursor = `url(${cursorCustomer}) 16 16, auto`;
                window.NOP_VIEWER.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, onScrollEnd);
            } else {
                window.NOP_VIEWER.canvas.style.cursor = `url(${forgeCursor}), auto`;
            }
        }

        return () => {
            if (window?.NOP_VIEWER) {
                window?.NOP_VIEWER?.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, onScrollEnd);
            }
        }
    }, [cursorCustomer])

    const onScrollEnd = (event: any) => {
        if (!window?.NOP_VIEWER?.canvas) return;
        if (cursorCustomer) {
            window.NOP_VIEWER.canvas.style.cursor = `url(${cursorCustomer}) 16 16, auto`;
        } else {
            window.NOP_VIEWER.canvas.style.cursor = `url(${forgeCursor}), auto`;
        }
    }

    return (
        <></>
    );
};

export default React.memo(CursorCustomer);