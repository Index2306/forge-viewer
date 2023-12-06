export const StartToolDistance = (tool: boolean | undefined, callback?: (v: any) => void): boolean => {

  if (!window.NOP_VIEWER) return false;

  try {
    const controller = window.NOP_VIEWER.toolController;
    
    if (!tool) {
      controller.deactivateTool("measure");

      return true;
    }
    else {
      controller.activateTool("measure");
    }
    return true;
  } catch (err: any) {
    console.error(err)
    return false;
  }
}
