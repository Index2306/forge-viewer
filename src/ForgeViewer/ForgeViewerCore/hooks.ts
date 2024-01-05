import React, {useContext} from 'react';
import {loadScripts} from './helper';
import {
    DEFAULT_DOCUMENT_LOAD_ERROR,
    DEFAULT_DOCUMENT_LOAD_SUCCESS,
    DEFAULT_INITIALIZER_OPTIONS,
    DEFAULT_ON_INIT,
    DEFAULT_VERSION,
    DEFAULT_VIEWABLE_OPTIONS,
    DEFAULT_VIEWER_OPTIONS
} from './default';
import {loadCustomTool} from "@/ForgeViewer/CustomTool/load";
import { ForgeViewerContext } from '@/context/ForgeViewerContext';

type State = {
    scriptsLoaded: boolean;
    scriptElement: HTMLScriptElement | null;
    styleElement: HTMLScriptElement | null;
};
type Refs = {
    viewer: any;
};
type Setters = {
    setScriptsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

type Hooks = {
    refs: Refs;
    state?: State;
    setters?: Setters;
    style: React.CSSProperties;
};

export function useHooks({
                             local = false,
                             version = DEFAULT_VERSION, isMinFile = true, isLMV = false,
                             path,
                             token,
                             urn,
                             initializerOptions,
                             viewerOptions,
                             headless = false,
                             onDocumentLoadSuccess = DEFAULT_DOCUMENT_LOAD_SUCCESS,
                             onDocumentLoadError = DEFAULT_DOCUMENT_LOAD_ERROR,
                             viewableOptions = DEFAULT_VIEWABLE_OPTIONS,
                             onInit = DEFAULT_ON_INIT,
                             extensions,
                             style = {},
                             disableLoader = false,
                             activeTool,
                             isReload,
                             setIsReload,
                             setIsFetching,
                             setViewer,

                         }: any): Hooks {
    // declare state
    const [scriptsLoaded, setScriptsLoaded] = React.useState<boolean>(false);
    const [
        scriptElement,
        setScriptElement
    ] = React.useState<HTMLScriptElement | null>(null);
    const [
        styleElement,
        setStyleElement
    ] = React.useState<HTMLLinkElement | null>(null);
    // viewer container ref
    const viewerRef = React.useRef<any>(null);

    //Context
    const {modelType} = useContext(ForgeViewerContext)

    // viewer object
    let viewer: Autodesk.Viewing.Viewer3D;
    // forge initializer options, default settings for Derivatives API
    // if passed 'local' as true it changes that to Local and allows to load SVF
    // see: https://forge.autodesk.com/en/docs/viewer/v7/reference/Viewing/#initializer-options-callback
    const initializerOpts: Autodesk.Viewing.InitializerOptions = Object.assign(
        DEFAULT_INITIALIZER_OPTIONS,
        initializerOptions
    );
    if (local) {
        initializerOpts.env = 'Local';
    } else {
        initializerOpts.getAccessToken = (done: (t: string, n: number) => void) =>
            done(token, 3600);
    }
    // viewer options
    // see: https://forge.autodesk.com/en/docs/viewer/v7/reference/Viewing/Viewer3D/#new-viewer3d-container-config
    const viewerOpts: Autodesk.Viewing.Viewer3DConfig = Object.assign(
        DEFAULT_VIEWER_OPTIONS,
        viewerOptions
    );
    // initialize the viewer, depending on some parameters can instantiate a headless viewer,
    // can load SVF files, can load all the provided extensions
    const initialize = (): void => {
        Autodesk.Viewing.Initializer(initializerOpts, () => {
            if (headless) {
                viewer = new Autodesk.Viewing.Viewer3D(viewerRef.current, viewerOpts);
            } else {
                viewer = new Autodesk.Viewing.GuiViewer3D(
                    viewerRef.current,
                    viewerOpts
                );
            }

            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
                if (setIsFetching) {
                    setIsFetching(false)
                }
                console.log("Model geometry loaded and ready!");
            });

            viewer.addEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, (e) => {
                // @ts-ignore
                const spinnerContainer = (viewer as any)._loadingSpinner.domElement;

                // Remove 2 children element inside:
                // <svg> tag: that represents for loading logo
                // <img> tag: that represents for Autodesk logo
                while (spinnerContainer.hasChildNodes()) {
                    spinnerContainer.removeChild(spinnerContainer.lastChild);
                }

                const speamLogo = document.createElement('img');
                // speamLogo.src = `${window.location.origin}/assets/img/logo_speamplan--black.svg`;
                speamLogo.alt = 'speam-logo';
                speamLogo.id = 'speam-logo-forge-loading';
                spinnerContainer.appendChild(speamLogo);

                // if (disableLoader) {
                //     const spinnerContainer = (viewer as any)._loadingSpinner.domElement;
                //     while (spinnerContainer.hasChildNodes()) {
                //         spinnerContainer.removeChild(spinnerContainer.lastChild);
                //     }
                // }
                onInit(e);
            });
            const startedCode = viewer.start(path);
            if (startedCode > 0) {
                console.error('Failed to create a Viewer: WebGL not supported.');
                return;
            }
            if (extensions) {
                extensions.forEach((extension: any) => {
                    Autodesk.Viewing.theExtensionManager.registerExtension(
                        extension.extensionName,
                        extension
                    );
                    viewer.loadExtension(extension.extensionName, viewerOptions);
                });
            }

            viewer.loadExtension('Autodesk.Edit2D', viewerOptions).then((edit2d: any) => {
                edit2d.registerDefaultTools();
                window.edit2d = edit2d;
                window.edit2dTools = edit2d.defaultTools;
                window.edit2dLayer = edit2d.defaultContext.layer;
                window.edit2dSelection = edit2d.defaultContext.selection;
                window.edit2dUndoStack = edit2d.defaultContext.undoStack;
                console.log('Reload Edit2D Tools')
                loadCustomTool(viewer, edit2d.defaultTools)

            });

            if (activeTool) {
                const ToolConstructor = activeTool;
                const toolController = (viewer as any).toolController;
                const tool = new ToolConstructor(viewer, viewerOptions);
                toolController.registerTool(tool);
                toolController.activateTool(tool.toolName);
            }
        });
    };
    // onDocumentLoadSuccess wrapper
    const handleDocumentLoad = (
        viewerDocument: Autodesk.Viewing.Document
    ): void => {
        const viewable = onDocumentLoadSuccess(viewerDocument, modelType);

        viewer.loadDocumentNode(viewerDocument, viewable, viewableOptions).then((e) => {
            // set viewer after load model success
            window.NOP_VIEWER = viewer;
            if (setViewer) {
                setViewer(viewer);
            }

            // handle complete load model
            viewer.toolbar?.setDisplay('none')
        });
    };

    // load model using Derivatives API
    const loadModel = (): void => {
        Autodesk.Viewing.Document.load(
            `urn:${urn}`,
            handleDocumentLoad,
            onDocumentLoadError,
        );
    };
    // triggered on forge scripts loaded
    React.useEffect(() => {
        if (setIsFetching) {
            setIsFetching(true)
        }

        if (!window.Autodesk) {
            loadScripts(version, isMinFile, isLMV)
                .then(({ script, style }) => {
                    setScriptElement(script);
                    setStyleElement(style);
                    setScriptsLoaded(true);
                })
                .catch((error) => {
                    // console.error(error);
                });
        } else {
            setScriptsLoaded(true);
        }
        if (scriptsLoaded) {
            initialize();
            if (!local) loadModel();

        }
        return () => {
            if (scriptElement && styleElement) {
                document.body.removeChild(scriptElement);
                document.body.removeChild(styleElement);
            }
        };
    }, [scriptsLoaded]);

    // triggered on forge scripts loaded
    React.useEffect(() => {
        if (isReload) {
            if (setIsFetching) {
                setIsFetching(true)
            }

            if (!window.Autodesk) {
                loadScripts(version, isMinFile, isLMV)
                    .then(({ script, style }) => {
                        setScriptElement(script);
                        setStyleElement(style);
                        setScriptsLoaded(true);

                    })
                    .catch((error) => {
                        // console.error(error);
                    });
            } else {
                setScriptsLoaded(true);
            }
            if (scriptsLoaded) {
                initialize();
                if (!local) loadModel();
            }
            setIsReload(false)

        }
        return () => {
            if (scriptElement && styleElement) {
                document.body.removeChild(scriptElement);
                document.body.removeChild(styleElement);
            }
        };
    }, [isReload]);

    return {
        refs: {
            viewer: viewerRef
        },
        style
    };
}
