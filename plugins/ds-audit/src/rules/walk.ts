/**
 * rules/walk.ts
 * ----------------------------------------------------------------
 * Shared walker for Figma node tree traversal.
 *
 * RESPONSIBILITIES:
 * - Recursively traverse Figma nodes
 * - Filter hidden, internal, and user-ignored nodes
 * - Provide a callback (visitor) for each valid node
 *
 * SKIP CONVENTIONS:
 * - visible === false -> hidden node, skipped
 * - SKIP_TYPES -> Figma infrastructure types (STICKY, WIDGET, etc.)
 * - Name starts with "." -> Figma internal
 * - Name starts with "_" -> user-ignored
 * - LINE/VECTOR inside COMPONENT_SET -> variant dividers
 * - SECTION -> skips self-check (via shouldSkipSelfCheck), but recurses children
 *
 * EXECUTION: Runs on the main thread (Figma sandbox), NOT in the UI.
 */

/** Callback invoked for each valid node during the walk */
export type NodeVisitor = (
  node: SceneNode,
  parentPath: string[],
  parentType: string | null,
) => void

/** Node types that are Figma infrastructure, not user content */
const SKIP_TYPES = new Set([
  'STICKY', 'STAMP', 'WIDGET', 'CONNECTOR', 'SHAPE_WITH_TEXT',
  'CODE_BLOCK', 'TABLE', 'EMBED', 'LINK_UNFURL',
])

/** Types that should NOT be checked directly, but MUST have children checked */
const SKIP_SELF_CHECK = new Set(['SECTION'])

/**
 * Checks if a node should be completely skipped (no recursion into children).
 * - Figma infrastructure types
 * - Figma internal names (start with ".")
 * - User-ignored names (start with "_")
 * - Variant dividers inside COMPONENT_SET
 */
function shouldSkipEntirely(node: SceneNode, parentType: string | null): boolean {
  if (SKIP_TYPES.has(node.type)) return true
  if (node.name.startsWith('.')) return true
  if (node.name.startsWith('_')) return true
  if (parentType === 'COMPONENT_SET' && (node.type === 'LINE' || node.type === 'VECTOR')) {
    return true
  }
  return false
}

/**
 * Checks if a node should skip self-check but have children traversed.
 * Used for SECTION: doesn't have relevant fills/strokes, but contains frames.
 */
export function shouldSkipSelfCheck(node: SceneNode): boolean {
  return SKIP_SELF_CHECK.has(node.type)
}

/**
 * Recursively walks the node tree, calling the visitor for each valid node.
 *
 * @param nodes - Root nodes to traverse
 * @param visitor - Callback for each valid node (not hidden, not internal, not ignored).
 *   Nodes in SKIP_SELF_CHECK do NOT receive a visitor call, but their children do.
 */
export function walkNodes(
  nodes: readonly SceneNode[],
  visitor: NodeVisitor,
): void {
  for (const node of nodes) {
    walkSingle(node, [], null, visitor)
  }
}

/** Walks a single node and its children recursively */
function walkSingle(
  node: SceneNode,
  parentPath: string[],
  parentType: string | null,
  visitor: NodeVisitor,
): void {
  // Skip hidden nodes
  if (!node.visible) return

  // Skip nodes that should be entirely ignored
  if (shouldSkipEntirely(node, parentType)) return

  const currentPath = [...parentPath, node.name]

  // Call visitor only if not a skip-self-check node
  if (!SKIP_SELF_CHECK.has(node.type)) {
    visitor(node, parentPath, parentType)
  }

  // Recurse into children
  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      walkSingle(child as SceneNode, currentPath, node.type, visitor)
    }
  }
}
