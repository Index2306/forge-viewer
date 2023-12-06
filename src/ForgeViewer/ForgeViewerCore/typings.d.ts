declare module 'forge-viewer';

declare module 'hat-forge-viewer' {
    import {Props} from "next/script";
    export const ForgeViewer: (props: Props) => React.ReactElement<Props>;
}