import { useContext, useEffect, useState } from "react"
import { ForgeViewerContext } from "@/context/ForgeViewerContext"

export function useActiveGroupToolsOnViewer({ groupToolNames }: {groupToolNames: string[]}) {
  const {activeTool, setActiveTool, setCursorCustomer} = useContext(ForgeViewerContext)
  const [isActiveCurrentTool, setIsActiveCurrentTool] = useState<boolean>(false)
  useEffect(() => {
      const hasActive = [...groupToolNames].includes(activeTool)

      setIsActiveCurrentTool(hasActive)
  }, [activeTool, window.activeTool, groupToolNames])

  return {
      isActiveCurrentTool,
      activeTool,
      setActiveTool,
      setCursorCustomer
  }
}