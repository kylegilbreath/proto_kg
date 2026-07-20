"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import type { TreeNode } from "./preview-data"

export function TreeRows({
  nodes,
  depth,
  activeId,
  onSelect,
}: {
  nodes: TreeNode[]
  depth: number
  activeId: string
  onSelect: (id: string) => void
}) {
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    const walk = (ns: TreeNode[]) =>
      ns.forEach((n) => {
        if (n.type === "folder") {
          m[n.id] = !!n.open
          if (n.children) walk(n.children)
        }
      })
    walk(nodes)
    return m
  })

  const render = (ns: TreeNode[], d: number): React.ReactNode =>
    ns.map((n) => {
      if (n.type === "folder") {
        const open = openMap[n.id]
        return (
          <React.Fragment key={n.id}>
            <button
              className="tree-row"
              style={{ paddingLeft: 8 + d * 12 }}
              onClick={() => setOpenMap((mp) => ({ ...mp, [n.id]: !mp[n.id] }))}
            >
              <ChevronRight className={`lucide chev${open ? " open" : ""}`} style={{ width: 12, height: 12 }} />
              {open ? (
                <FolderOpen className="lucide" style={{ width: 14, height: 14 }} />
              ) : (
                <Folder className="lucide" style={{ width: 14, height: 14 }} />
              )}
              <span className="truncate">{n.name}</span>
            </button>
            {open && n.children && render(n.children, d + 1)}
          </React.Fragment>
        )
      }
      return (
        <button
          key={n.id}
          className={`tree-row${activeId === n.id ? " active" : ""}`}
          style={{ paddingLeft: 8 + d * 12 + 18 }}
          onClick={() => onSelect(n.id)}
        >
          <File className="lucide" style={{ width: 14, height: 14 }} />
          <span className="truncate">{n.name}</span>
        </button>
      )
    })

  return <>{render(nodes, depth)}</>
}
